import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { KafkaService } from '../kafka/kafka.service';

interface RawOutboxEvent {
  id: string;
  topic: string;
  payload: unknown;
  retryCount: number;
}

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
      await this.prisma.$transaction(async (tx) => {
        // SECURITY / CONCURRENCY (ARCH-003): Use FOR UPDATE SKIP LOCKED to prevent
        // duplicate delivery across concurrent replicas and exponential backoff to avoid head-of-line blocking.
        const events = await tx.$queryRaw<RawOutboxEvent[]>`
          SELECT id, topic, payload, "retryCount"
          FROM "identity"."outbox_events"
          WHERE "published" = false
            AND COALESCE("retryCount", 0) < 5
            AND ("lastRetryAt" IS NULL OR "lastRetryAt" < NOW() - (INTERVAL '1 second' * (5 * POWER(2, COALESCE("retryCount", 0)))))
          ORDER BY "createdAt" ASC
          LIMIT 50
          FOR UPDATE SKIP LOCKED
        `;

        if (!events || events.length === 0) {
          return;
        }

        this.logger.debug(`Found ${events.length} unpublished outbox events`);

        for (const event of events) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const payload =
              typeof event.payload === 'string' ? JSON.parse(event.payload) : event.payload;

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await this.kafkaService.publish(event.topic, payload);

            await tx.outboxEvent.update({
              where: { id: event.id },
              data: {
                published: true,
                publishedAt: new Date(),
                error: null,
              },
            });

            this.logger.debug(`Successfully published outbox event ${event.id}`);
          } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            const currentRetries = event.retryCount ?? 0;
            this.logger.error(
              `Failed to publish outbox event ${event.id} (attempt ${currentRetries + 1}/5): ${errorMsg}`,
              error instanceof Error ? error.stack : undefined,
            );

            await tx.outboxEvent.update({
              where: { id: event.id },
              data: {
                retryCount: currentRetries + 1,
                lastRetryAt: new Date(),
                error: errorMsg,
              },
            });
          }
        }
      });
    } catch (error) {
      this.logger.error('Error processing outbox events', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
