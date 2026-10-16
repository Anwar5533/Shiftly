/* eslint-disable @typescript-eslint/no-unsafe-assignment -- Jest expect.any matcher typing */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { KafkaConsumerService } from './kafka.consumer.service';
import { PrismaService } from '../database/prisma.service';
import { KafkaTopics } from '@shiftly/shared-events';

const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockRun = jest.fn();
const mockDisconnect = jest.fn().mockResolvedValue(undefined);

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    consumer: jest.fn().mockReturnValue({
      connect: mockConnect,
      subscribe: mockSubscribe,
      run: mockRun,
      disconnect: mockDisconnect,
    }),
  })),
}));

describe('KafkaConsumerService', () => {
  let service: KafkaConsumerService;
  let prisma: {
    jobApplication: { findUnique: jest.Mock };
    escrowLock: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
  let configService: { get: jest.Mock };
  let messageHandler: (payload: {
    topic: string;
    message: { value: Buffer | null };
  }) => Promise<void>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockRun.mockImplementation(
      (config: {
        eachMessage: (payload: {
          topic: string;
          message: { value: Buffer | null };
        }) => Promise<void>;
      }) => {
        messageHandler = config.eachMessage;
      },
    );

    prisma = {
      jobApplication: {
        findUnique: jest.fn(),
      },
      escrowLock: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'kafka.brokers') return 'localhost:9092';
        if (key === 'kafka.clientId') return 'payments-service';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaConsumerService,
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<KafkaConsumerService>(KafkaConsumerService);
  });

  it('should initialize, connect, subscribe to Jobs topic, and register message runner', async () => {
    await service.onModuleInit();

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith({ topic: KafkaTopics.Jobs, fromBeginning: true });
    expect(mockRun).toHaveBeenCalledTimes(1);
    expect(messageHandler).toBeDefined();
  });

  it('should disconnect consumer onModuleDestroy', async () => {
    await service.onModuleDestroy();
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  describe('eachMessage handler', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should ignore message with null value', async () => {
      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: null },
      });

      expect(prisma.jobApplication.findUnique).not.toHaveBeenCalled();
    });

    it('should ignore messages that are not shift.completed', async () => {
      const message = {
        type: 'other.event',
        payload: { something: true },
      };

      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: Buffer.from(JSON.stringify(message)) },
      });

      expect(prisma.jobApplication.findUnique).not.toHaveBeenCalled();
    });

    it('should return early when job application is not found', async () => {
      const event = {
        eventId: '11111111-1111-1111-1111-111111111111',
        traceId: '22222222-2222-2222-2222-222222222222',
        type: 'shift.completed',
        timestamp: new Date().toISOString(),
        payload: {
          shiftId: 'shift-1',
          jobId: 'job-1',
          workerId: 'worker-prof-1',
        },
      };

      prisma.jobApplication.findUnique.mockResolvedValue(null);

      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: Buffer.from(JSON.stringify(event)) },
      });

      expect(prisma.jobApplication.findUnique).toHaveBeenCalledWith({
        where: {
          jobId_workerId: {
            jobId: 'job-1',
            workerId: 'worker-prof-1',
          },
        },
      });
      expect(prisma.escrowLock.findFirst).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should return early when escrow lock is not found', async () => {
      const event = {
        eventId: '11111111-1111-1111-1111-111111111111',
        traceId: '22222222-2222-2222-2222-222222222222',
        type: 'shift.completed',
        timestamp: new Date().toISOString(),
        payload: {
          shiftId: 'shift-1',
          jobId: 'job-1',
          workerId: 'worker-prof-1',
        },
      };

      prisma.jobApplication.findUnique.mockResolvedValue({ id: 'app-1' });
      prisma.escrowLock.findFirst.mockResolvedValue(null);

      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: Buffer.from(JSON.stringify(event)) },
      });

      expect(prisma.escrowLock.findFirst).toHaveBeenCalledWith({
        where: {
          applicationId: 'app-1',
          status: 'LOCKED',
        },
      });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should atomically release escrow, resolve worker user ID, credit wallet, and record transaction', async () => {
      const event = {
        eventId: '11111111-1111-1111-1111-111111111111',
        traceId: '22222222-2222-2222-2222-222222222222',
        type: 'shift.completed',
        timestamp: new Date().toISOString(),
        payload: {
          shiftId: 'shift-1',
          jobId: 'job-1',
          workerId: 'worker-prof-1',
        },
      };

      prisma.jobApplication.findUnique.mockResolvedValue({ id: 'app-1' });
      prisma.escrowLock.findFirst.mockResolvedValue({ id: 'lock-1' });

      const txMock = {
        escrowLock: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'lock-1',
            status: 'LOCKED',
            amount: 2500,
            currency: 'INR',
          }),
          update: jest.fn().mockResolvedValue({ id: 'lock-1', status: 'RELEASED' }),
        },
        workerProfile: {
          findUnique: jest.fn().mockResolvedValue({
            userId: 'user-actual-worker-id',
          }),
        },
        wallet: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'wallet-worker-1',
            userId: 'user-actual-worker-id',
            balance: 500,
          }),
          update: jest.fn().mockResolvedValue({ id: 'wallet-worker-1' }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({ id: 'tx-1' }),
        },
      };

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof txMock) => Promise<unknown>) => {
          return callback(txMock);
        },
      );

      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: Buffer.from(JSON.stringify(event)) },
      });

      // Assertions
      expect(txMock.escrowLock.findUnique).toHaveBeenCalledWith({ where: { id: 'lock-1' } });
      expect(txMock.workerProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'worker-prof-1' },
        select: { userId: true },
      });
      expect(txMock.wallet.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-actual-worker-id' },
      });
      expect(txMock.escrowLock.update).toHaveBeenCalledWith({
        where: { id: 'lock-1' },
        data: { status: 'RELEASED', releasedAt: expect.any(Date) },
      });
      expect(txMock.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-worker-1' },
        data: { balance: { increment: 2500 } },
      });
      expect(txMock.transaction.create).toHaveBeenCalledWith({
        data: {
          walletId: 'wallet-worker-1',
          amount: 2500,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          referenceId: 'ESCROW-PAYOUT-lock-1',
          description: 'Escrow payout for shift shift-1',
          currency: 'INR',
        },
      });
    });

    it('should create wallet if not found, then release escrow and credit it', async () => {
      const event = {
        eventId: '22222222-2222-2222-2222-222222222222',
        traceId: '33333333-3333-3333-3333-333333333333',
        type: 'shift.completed',
        timestamp: new Date().toISOString(),
        payload: {
          shiftId: 'shift-2',
          jobId: 'job-2',
          workerId: 'worker-prof-2',
        },
      };

      prisma.jobApplication.findUnique.mockResolvedValue({ id: 'app-2' });
      prisma.escrowLock.findFirst.mockResolvedValue({ id: 'lock-2' });

      const txMock = {
        escrowLock: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'lock-2',
            status: 'LOCKED',
            amount: 1800,
            currency: 'INR',
          }),
          update: jest.fn().mockResolvedValue({ id: 'lock-2', status: 'RELEASED' }),
        },
        workerProfile: {
          findUnique: jest.fn().mockResolvedValue(null), // Fallbacks to workerId directly
        },
        wallet: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            id: 'new-wallet-id',
            userId: 'worker-prof-2',
            balance: 0,
          }),
          update: jest.fn().mockResolvedValue({ id: 'new-wallet-id' }),
        },
        transaction: {
          create: jest.fn().mockResolvedValue({ id: 'tx-2' }),
        },
      };

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof txMock) => Promise<unknown>) => {
          return callback(txMock);
        },
      );

      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: Buffer.from(JSON.stringify(event)) },
      });

      expect(txMock.wallet.create).toHaveBeenCalledWith({
        data: {
          userId: 'worker-prof-2',
          balance: 0,
          escrowBalance: 0,
          currency: 'INR',
        },
      });
      expect(txMock.wallet.update).toHaveBeenCalledWith({
        where: { id: 'new-wallet-id' },
        data: { balance: { increment: 1800 } },
      });
    });

    it('should not update if escrowLock is no longer LOCKED in transaction', async () => {
      const event = {
        eventId: '33333333-3333-3333-3333-333333333333',
        traceId: '44444444-4444-4444-4444-444444444444',
        type: 'shift.completed',
        timestamp: new Date().toISOString(),
        payload: {
          shiftId: 'shift-3',
          jobId: 'job-3',
          workerId: 'worker-prof-3',
        },
      };

      prisma.jobApplication.findUnique.mockResolvedValue({ id: 'app-3' });
      prisma.escrowLock.findFirst.mockResolvedValue({ id: 'lock-3' });

      const txMock = {
        escrowLock: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'lock-3',
            status: 'RELEASED', // Already released!
          }),
          update: jest.fn(),
        },
        workerProfile: { findUnique: jest.fn() },
        wallet: { findUnique: jest.fn(), update: jest.fn() },
        transaction: { create: jest.fn() },
      };

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof txMock) => Promise<unknown>) => {
          return callback(txMock);
        },
      );

      await messageHandler({
        topic: KafkaTopics.Jobs,
        message: { value: Buffer.from(JSON.stringify(event)) },
      });

      expect(txMock.escrowLock.update).not.toHaveBeenCalled();
      expect(txMock.wallet.update).not.toHaveBeenCalled();
    });
  });
});
