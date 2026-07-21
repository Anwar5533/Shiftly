import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AssistantMessage } from '@shiftly/shared-types';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  async sendMessage(@Body() body: { prompt: string; history?: AssistantMessage[] }) {
    return this.chatService.sendMessage(body.prompt, body.history);
  }
}
