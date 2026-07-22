/* eslint-disable prettier/prettier, @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
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
import { MessagingService } from './messaging.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@shiftly/shared-types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await -- TODO(RC3): Address type safety
  async handleConnection(client: Socket) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('No token provided');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      client.data.userId = payload.sub;
      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (error) {
      console.log(`Unauthorized client connection attempt: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
    client.join(conversationId);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() conversationId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises -- TODO(RC3): Address type safety
    client.leave(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { conversationId, content } = payload;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    const senderId = client.data.userId;

    if (!senderId) {
      client.disconnect();
      return;
    }

    const message = await this.messagingService.sendMessage(
      conversationId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      senderId,
      content,
    );

    // Emit the message to all clients in the room (including the sender to confirm)
    this.server.to(conversationId).emit('newMessage', message);
  }
}
