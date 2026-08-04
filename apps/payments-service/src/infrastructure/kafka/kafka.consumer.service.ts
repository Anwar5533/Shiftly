import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { PrismaService } from '../database/prisma.service';
import { KafkaTopics, ShiftCompletedEventSchema } from '@shiftly/shared-events';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const brokers = this.config.get<string>('kafka.brokers', 'localhost:9092').split(',');
    const clientId = this.config.get<string>('kafka.clientId', 'payments-service');

    this.kafka = new Kafka({
      clientId,
      brokers,
    });

    this.consumer = this.kafka.consumer({ groupId: 'payments-service-group' });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: KafkaTopics.Jobs, fromBeginning: true });

      await this.consumer.run({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- partition not needed for routing
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;

          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- JSON.parse returns unknown structure
            const parsed: Record<string, unknown> = JSON.parse(message.value.toString()) as Record<
              string,
              unknown
            >;

            if (parsed['type'] === 'shift.completed') {
              const validated = ShiftCompletedEventSchema.parse(parsed);
              const payload = validated.payload;

              const application = await this.prisma.jobApplication.findUnique({
                where: {
                  jobId_workerId: {
                    jobId: payload.jobId,
                    workerId: payload.workerId,
                  },
                },
              });

              if (!application) {
                this.logger.error(
                  `Application not found for job ${payload.jobId} and worker ${payload.workerId}`,
                );
                return;
              }

              const escrowLock = await this.prisma.escrowLock.findFirst({
                where: {
                  applicationId: application.id,
                  status: 'LOCKED',
                },
              });

              if (!escrowLock) {
                this.logger.error(`No locked escrow found for application ${application.id}`);
                return;
              }

              await this.prisma.$transaction(async (tx) => {
                const lock = await tx.escrowLock.findUnique({ where: { id: escrowLock.id } });
                if (!lock || lock.status !== 'LOCKED') return;

                await tx.escrowLock.update({
                  where: { id: lock.id },
                  data: { status: 'RELEASED', releasedAt: new Date() },
                });

                const workerWallet = await tx.wallet.findUnique({
                  where: { userId: payload.workerId },
                });

                if (workerWallet) {
                  await tx.wallet.update({
                    where: { id: workerWallet.id },
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Prisma Decimal type
                    data: { balance: { increment: lock.amount } },
                  });
                }
              });

              this.logger.log(
                `Successfully released escrow funds for job ${payload.jobId} to worker ${payload.workerId}`,
              );
            }
          } catch (error: unknown) {
            this.logger.error(`Error processing message from topic ${topic}`, error);
          }
        },
      });

      this.logger.log('Kafka Consumer connected and subscribed to Jobs topic');
    } catch (error: unknown) {
      this.logger.error('Failed to connect Kafka Consumer', error);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka Consumer disconnected');
  }
}
