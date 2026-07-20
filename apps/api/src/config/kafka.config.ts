import { registerAs } from '@nestjs/config';

export const kafkaConfig = registerAs('kafka', () => ({
  brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
  clientId: process.env.KAFKA_CLIENT_ID ?? 'shiftly-api',
  groupId: process.env.KAFKA_GROUP_ID ?? 'shiftly-consumer-group',
  ssl: process.env.KAFKA_SSL === 'true',
  saslMechanism: process.env.KAFKA_SASL_MECHANISM,
  saslUsername: process.env.KAFKA_SASL_USERNAME,
  saslPassword: process.env.KAFKA_SASL_PASSWORD,
}));
