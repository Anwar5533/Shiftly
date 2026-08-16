import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { PrismaService } from '../database/prisma.service';
import { KafkaTopics, ApplicationApprovedEventSchema } from '@shiftly/shared-events';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {
    const brokers = this.config.get<string>('kafka.brokers');
        const clientId = this.config.get<string>('kafka.clientId', 'jobs-service');
    const ssl = this.config.get<boolean>('kafka.ssl', false);
    const saslMechanism = this.config.get<string>('kafka.saslMechanism');
    const saslUsername = this.config.get<string>('kafka.saslUsername');
    const saslPassword = this.config.get<string>('kafka.saslPassword');

    const kafkaConfig: import('kafkajs').KafkaConfig = {
      clientId,
      brokers: Array.isArray(brokers) ? brokers : typeof brokers === "string" ? brokers.split(",") : [String(brokers)],
      ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
      ...(saslUsername
        ? {
            sasl: {
              mechanism: (saslMechanism || "scram-sha-256") as "scram-sha-256",
              username: saslUsername,
              password: saslPassword || "",
            } as import("kafkajs").SASLOptions,
          }
        : {}),
    };

    this.kafka = new Kafka(kafkaConfig);

    this.consumer = this.kafka.consumer({ groupId: 'jobs-service-group' });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: KafkaTopics.Applications, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          await this.cls.run(async () => {
            if (!message.value) return;

            try {
              const parsed = JSON.parse(message.value.toString()) as Record<string, unknown>;

              const parsedPayload = parsed.payload as Record<string, unknown> | undefined;
              const parsedTraceId = parsed.traceId || parsedPayload?.traceId;
              this.cls.set('traceId', (parsedTraceId as string) || uuidv4());

              if (parsed.type === 'application.approved') {
                const validated = ApplicationApprovedEventSchema.parse(parsed);
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

                const traceId = this.cls.get<string>('traceId');
                this.logger.log(
                  `[Trace: ${traceId}] Successfully created shift for application ${payload.applicationId}`,
                );
              }
            } catch (error) {
              const traceId = this.cls.get<string>('traceId');
              this.logger.error(
                `[Trace: ${traceId}] Error processing message from topic ${topic}`,
                error,
              );
            }
          });
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
