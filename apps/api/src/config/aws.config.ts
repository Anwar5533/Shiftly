import { registerAs } from '@nestjs/config';

export const awsConfig = registerAs('aws', () => ({
  region: process.env.AWS_REGION ?? 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3: {
    bucketName: process.env.AWS_S3_BUCKET ?? 'shiftly-uploads',
    presignedUrlExpireSeconds: parseInt(
      process.env.AWS_S3_PRESIGNED_EXPIRE ?? '3600',
      10,
    ),
  },
  ses: {
    fromEmail: process.env.AWS_SES_FROM_EMAIL ?? 'noreply@shiftly.com',
    fromName: process.env.AWS_SES_FROM_NAME ?? 'SHIFTLY',
  },
  sns: {
    smsTopicArn: process.env.AWS_SNS_SMS_TOPIC_ARN,
  },
  opensearch: {
    endpoint: process.env.OPENSEARCH_ENDPOINT ?? 'http://localhost:9200',
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
  },
}));
