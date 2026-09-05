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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('ChatGateway');
  // Simple in-memory storage for prototype
  private messages: any[] = [];
  private conversations: any[] = [
    {
      id: 'conv_1',
      updatedAt: new Date().toISOString(),
      participants: [
        { userId: 'user_1', user: { email: 'worker@shiftly.local' } },
        { userId: 'user_2', user: { email: 'employer@shiftly.local' } },
      ],
    },
  ];

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId);
    this.logger.log(`Client ${client.id} joined conversation: ${conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(conversationId);
    this.logger.log(`Client ${client.id} left conversation: ${conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; senderId: string; content: string },
  ) {
    const message = {
      id: `msg_${Date.now()}`,
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      createdAt: new Date().toISOString(),
    };
    
    this.messages.push(message);
    this.server.to(data.conversationId).emit('newMessage', message);
  }
}
