import { Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type { Prisma } from '@prisma/client-notifications-service';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class NotificationsService {
  private sesClient: SESClient;
  private snsClient: SNSClient;

  constructor(private readonly prisma: PrismaService) {
    this.sesClient = new SESClient({ region: process.env.AWS_REGION || 'ap-south-1' });
    this.snsClient = new SNSClient({ region: process.env.AWS_REGION || 'ap-south-1' });
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @OnEvent('notification.create', { async: true })
  async handleNotificationCreateEvent(payload: Prisma.NotificationCreateInput) {
    try {
      await this.prisma.notification.create({
        data: payload,
      });
      // In a full Zomato-scale app, we would also push this to a Redis Pub/Sub topic here
      // which would then broadcast to WebSockets.

      // Email dispatch via AWS SES
      if (payload.type === 'EMAIL' && payload.title) {
        await this.sesClient.send(new SendEmailCommand({
          Destination: { ToAddresses: ['test@shiftly.com'] }, // Mock target
          Message: {
            Body: { Text: { Data: payload.message } },
            Subject: { Data: payload.title }
          },
          Source: process.env.AWS_SES_FROM_EMAIL || 'noreply@shiftly.com'
        }));
      }

      // SMS dispatch via AWS SNS
      if (payload.type === 'SMS') {
        await this.snsClient.send(new PublishCommand({
          Message: payload.message,
          TopicArn: process.env.AWS_SNS_SMS_TOPIC_ARN,
        }));
      }
    } catch (error) {
      console.error('Failed to create/dispatch notification via event:', error);
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async clearNotifications(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
