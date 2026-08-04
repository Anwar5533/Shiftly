import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { BaseEvent } from '@shiftly/shared-events';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string[]>('kafka.brokers', ['localhost:9092']);
    const clientId = this.configService.get<string>('kafka.clientId', 'shiftly-api');

    this.kafka = new Kafka({
      clientId,
      brokers,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected safely');
    } catch (error) {
      this.logger.error('Failed to disconnect Kafka Producer safely', error);
    }
  }

  async publish(topic: string, event: BaseEvent): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.eventId, // Using eventId as the partition key for standard distribution, or maybe traceId
            value: JSON.stringify(event),
          },
        ],
      });
      this.logger.debug(`Published event ${event.eventId} to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.eventId} to topic ${topic}`, error);
      throw error;
    }
  }
}
