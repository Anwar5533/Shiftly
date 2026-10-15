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
    const brokers = this.config.get<string>('kafka.brokers');
    const clientId = this.config.get<string>('kafka.clientId', 'payments-service');
    const ssl = this.config.get<boolean>('kafka.ssl', false);
    const saslMechanism = this.config.get<string>('kafka.saslMechanism');
    const saslUsername = this.config.get<string>('kafka.saslUsername');
    const saslPassword = this.config.get<string>('kafka.saslPassword');

    const kafkaConfig: import('kafkajs').KafkaConfig = {
      clientId,
      brokers: Array.isArray(brokers)
        ? brokers
        : typeof brokers === 'string'
          ? brokers.split(',')
          : [String(brokers)],
      ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
      ...(saslUsername
        ? {
            sasl: {
              mechanism: (saslMechanism || 'scram-sha-256') as 'scram-sha-256',
              username: saslUsername,
              password: saslPassword || '',
            },
          }
        : {}),
    };

    this.kafka = new Kafka(kafkaConfig);

    this.consumer = this.kafka.consumer({ groupId: 'payments-service-group' });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: KafkaTopics.Jobs, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;

          try {
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

                // Resolve worker's User.id from payload.workerId (which is WorkerProfile.id)
                let resolvedUserId = payload.workerId;
                const workerProfile = await tx.workerProfile.findUnique({
                  where: { id: payload.workerId },
                  select: { userId: true },
                });
                if (workerProfile?.userId) {
                  resolvedUserId = workerProfile.userId;
                }

                // Locate or create worker wallet using resolved User.id
                let workerWallet = await tx.wallet.findUnique({
                  where: { userId: resolvedUserId },
                });

                if (!workerWallet) {
                  workerWallet = await tx.wallet.create({
                    data: {
                      userId: resolvedUserId,
                      balance: 0,
                      escrowBalance: 0,
                      currency: lock.currency || 'INR',
                    },
                  });
                }

                // Atomically mark escrow released, credit worker wallet, and record payout transaction
                await tx.escrowLock.update({
                  where: { id: lock.id },
                  data: { status: 'RELEASED', releasedAt: new Date() },
                });

                await tx.wallet.update({
                  where: { id: workerWallet.id },
                  data: { balance: { increment: lock.amount } },
                });

                await tx.transaction.create({
                  data: {
                    walletId: workerWallet.id,
                    amount: lock.amount,
                    type: 'ESCROW_RELEASE',
                    status: 'COMPLETED',
                    referenceId: `ESCROW-PAYOUT-${lock.id}`,
                    description: `Escrow payout for shift ${payload.shiftId}`,
                    currency: lock.currency || 'INR',
                  },
                });
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
