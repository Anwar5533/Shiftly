import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('messaging')
@Controller('messaging')
export class ChatController {
  private conversations = [
    {
      id: 'conv_1',
      updatedAt: new Date().toISOString(),
      participants: [
        { userId: 'user_1', user: { email: 'worker@shiftly.local' } },
        { userId: 'user_2', user: { email: 'employer@shiftly.local' } },
      ],
      messages: [{ content: 'Hi, are you available for the shift?', createdAt: new Date().toISOString() }],
    },
  ];

  private messages = [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'user_2',
      content: 'Hi, are you available for the shift?',
      createdAt: new Date().toISOString(),
    },
  ];

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  getConversations() {
    return { data: this.conversations };
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for conversation' })
  getMessages(@Param('id') id: string) {
    return { data: this.messages.filter(m => m.conversationId === id) };
  }
}
