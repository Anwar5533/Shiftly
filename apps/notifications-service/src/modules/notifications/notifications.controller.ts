import { Controller, Get, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@Controller({ path: 'notifications', version: '1' })
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.notificationsService.getNotifications(req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Delete()
  async clearNotifications(@Request() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
    await this.notificationsService.clearNotifications(req.user.id);
    return { success: true };
  }

  @EventPattern('application.approved')
  handleApplicationApproved(
    @Payload() message: { payload: { applicationId: string; workerId: string } },
  ) {
    // message is the full event payload (from shared-events schema)
    const { applicationId, workerId } = message.payload;
    console.log(
      `[Notification] Shift confirmed for worker ${workerId} on application ${applicationId}. Simulating push notification...`,
    );
    // Here we would typically call a service method to send a real push notification
    // e.g., await this.notificationsService.sendPushNotification(workerId, 'Your shift is confirmed!');
  }
}
