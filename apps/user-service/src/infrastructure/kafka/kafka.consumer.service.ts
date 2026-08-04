import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer } from 'kafkajs';
import { PrismaService } from '../database/prisma.service';
import { KafkaTopics, UserRegisteredEventSchema } from '@shiftly/shared-events';

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
    const clientId = this.config.get<string>('kafka.clientId', 'user-service');

    this.kafka = new Kafka({
      clientId,
      brokers,
    });

    this.consumer = this.kafka.consumer({ groupId: 'user-service-group' });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: KafkaTopics.Identity, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;

          try {
            const parsed = JSON.parse(message.value.toString()) as Record<string, unknown>;

            if (parsed && typeof parsed === 'object' && parsed.type === 'user.registered') {
              const validated = UserRegisteredEventSchema.parse(parsed);
              const payload = validated.payload;

              if (payload.role === 'EMPLOYER') {
                await this.prisma.employerProfile.create({
                  data: { userId: payload.userId, companyName: '', industry: '', location: {} },
                });
              } else if (payload.role === 'WORKER') {
                await this.prisma.workerProfile.create({
                  data: {
                    userId: payload.userId,
                    firstName: 'New',
                    lastName: 'Worker',
                    location: {},
                  },
                });
              } else if (payload.role === 'RECRUITER') {
                await this.prisma.recruiterProfile.create({
                  data: { userId: payload.userId, firstName: '', lastName: '' },
                });
              }

              this.logger.log(`Successfully created profile for user ${payload.userId}`);
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}`, error);
          }
        },
      });

      this.logger.log('Kafka Consumer connected and subscribed to Identity topic');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Consumer', error);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka Consumer disconnected');
  }
}
