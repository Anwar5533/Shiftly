/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  async getConversations(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.messagingService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.messagingService.getMessages(id, req.user.id);
  }
}
