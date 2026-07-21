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

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagingService: MessagingService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.join(conversationId);
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.leave(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() payload: { conversationId: string; senderId: string; content: string },
    @ConnectedSocket() client: Socket
  ) {
    const { conversationId, senderId, content } = payload;
    const message = await this.messagingService.sendMessage(conversationId, senderId, content);

    // Emit the message to all clients in the room (including the sender to confirm)
    this.server.to(conversationId).emit('newMessage', message);
  }
}
