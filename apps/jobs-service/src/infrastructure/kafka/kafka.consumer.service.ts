import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { PrismaService } from '../database/prisma.service';
import { KafkaTopics, ApplicationHiredEventSchema } from '@shiftly/shared-events';

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
    const clientId = this.config.get<string>('kafka.clientId', 'jobs-service');

    this.kafka = new Kafka({
      clientId,
      brokers,
    });

    this.consumer = this.kafka.consumer({ groupId: 'jobs-service-group' });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: KafkaTopics.Applications, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;

          try {
            const parsed = JSON.parse(message.value.toString()) as Record<string, unknown>;

            if (parsed.type === 'application.hired') {
              const validated = ApplicationHiredEventSchema.parse(parsed);
              const payload = validated.payload;

              await this.prisma.$transaction(async (tx) => {
                const job = await tx.job.findUnique({
                  where: { id: payload.jobId },
                });

                if (!job) {
                  throw new Error(`Job ${payload.jobId} not found`);
                }

                await tx.shift.create({
                  data: {
                    jobId: payload.jobId,
                    applicationId: payload.applicationId,
                    workerId: payload.workerId,
                    scheduledStart: job.startDate,
                    scheduledEnd: job.endDate || job.startDate,
                    status: 'SCHEDULED',
                  },
                });

                await tx.job.update({
                  where: { id: payload.jobId },
                  data: {
                    positionsFilled: { increment: 1 },
                  },
                });
              });

              this.logger.log(
                `Successfully created shift for application ${payload.applicationId}`,
              );
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}`, error);
          }
        },
      });

      this.logger.log('Kafka Consumer connected and subscribed to Applications topic');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Consumer', error);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka Consumer disconnected');
  }
}
