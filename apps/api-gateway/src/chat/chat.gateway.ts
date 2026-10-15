import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';
import { TokenDenylistService } from '../auth/token-denylist.service';

interface AuthenticatedSocketData {
  user?: {
    userId: string;
    role?: string;
    sessionId?: string;
  };
}

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger('ChatGateway');
  // In-memory message store for local session persistence
  private messages: Array<{
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: string;
  }> = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenDenylistService: TokenDenylistService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const handshakeAuth = client.handshake.auth as Record<string, unknown> | undefined;
    const rawAuth =
      (typeof handshakeAuth?.token === 'string' ? handshakeAuth.token : undefined) ??
      client.handshake.headers?.authorization;

    if (!rawAuth) {
      this.logger.warn(`Unauthorized WebSocket connection rejected: missing token (${client.id})`);
      client.disconnect(true);
      return;
    }

    const token = rawAuth.startsWith('Bearer ') ? rawAuth.slice(7).trim() : rawAuth.trim();

    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      this.logger.error('FATAL: JWT_ACCESS_SECRET is not configured for WebSocket gateway');
      client.disconnect(true);
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Malformed JWT structure');
      }

      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(`${parts[0]}.${parts[1]}`)
        .digest('base64url');

      const providedSig = parts[2];
      if (
        expectedSig.length !== providedSig.length ||
        !crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(providedSig))
      ) {
        throw new Error('Invalid JWT signature');
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
        sub?: string;
        role?: string;
        sessionId?: string;
        exp?: number;
      };

      if (!payload.sub) {
        throw new Error('Missing sub claim');
      }

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      const isRevoked = await this.tokenDenylistService.isRevoked(payload.sessionId, payload.sub);
      if (isRevoked) {
        throw new Error('Token revoked');
      }

      const socketData = client.data as AuthenticatedSocketData;
      socketData.user = {
        userId: payload.sub,
        role: payload.role,
        sessionId: payload.sessionId,
      };

      this.logger.log(`Authenticated client connected: ${client.id} (user: ${payload.sub})`);
    } catch (error: unknown) {
      this.logger.warn(
        `WebSocket authentication failed for ${client.id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {
    void client.join(conversationId);
    this.logger.log(`Client ${client.id} joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    void client.leave(conversationId);
    this.logger.log(`Client ${client.id} left conversation: ${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const socketData = client.data as AuthenticatedSocketData;
    const user = socketData.user;
    if (!user || !user.userId) {
      this.logger.warn(`Unauthenticated message attempt from ${client.id}`);
      client.disconnect(true);
      return;
    }

    const message = {
      id: `msg_${Date.now()}`,
      conversationId: data.conversationId,
      senderId: user.userId, // Authenticated identity prevents impersonation
      content: data.content,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(message);
    this.server.to(data.conversationId).emit('newMessage', message);
  }
}
