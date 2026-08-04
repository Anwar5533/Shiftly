export const KafkaTopics = {
  Identity: 'identity.events.v1',
  Jobs: 'jobs.events.v1',
  Applications: 'applications.events.v1',
  Payments: 'payments.events.v1',
  Notifications: 'notifications.events.v1',
} as const;

export type KafkaTopic = (typeof KafkaTopics)[keyof typeof KafkaTopics];
