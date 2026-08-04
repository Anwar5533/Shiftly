import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaService: KafkaService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutboxEvents() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const events = await this.prisma.outboxEvent.findMany({
        where: { published: false },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        return;
      }

      this.logger.debug(`Found ${events.length} unpublished outbox events`);

      for (const event of events) {
        try {
          // payload is stored as Json in Prisma
          const payload = event.payload as any;
          await this.kafkaService.publish(event.topic, payload);

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              published: true,
              publishedAt: new Date(),
            },
          });

          this.logger.debug(`Successfully published outbox event ${event.id}`);
        } catch (error: any) {
          this.logger.error(`Failed to publish outbox event ${event.id}`, error);

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              error: error.message || 'Unknown error',
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error processing outbox events', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
