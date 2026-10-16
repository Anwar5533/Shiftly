/* eslint-disable @typescript-eslint/no-unsafe-assignment -- Jest expect.any matcher typing */
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from './outbox.service';
import { PrismaService } from '../database/prisma.service';
import { KafkaService } from '../kafka/kafka.service';

describe('OutboxService (payments-service)', () => {
  let service: OutboxService;
  let prisma: {
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
    outboxEvent: {
      update: jest.Mock;
    };
  };
  let kafkaService: {
    publish: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback: (tx: typeof prisma) => Promise<unknown>) => {
        return callback(prisma);
      }),
      $queryRaw: jest.fn(),
      outboxEvent: {
        update: jest.fn(),
      },
    };

    kafkaService = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        { provide: PrismaService, useValue: prisma },
        { provide: KafkaService, useValue: kafkaService },
      ],
    }).compile();

    service = module.get<OutboxService>(OutboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process pending outbox events and mark them published', async () => {
    const mockEvents = [
      {
        id: 'evt-1',
        topic: 'payments.events.v1',
        payload: { escrowId: 'escrow-1', status: 'RELEASED' },
        retryCount: 0,
      },
    ];

    prisma.$queryRaw.mockResolvedValue(mockEvents);
    kafkaService.publish.mockResolvedValue(undefined);
    prisma.outboxEvent.update.mockResolvedValue({});

    await service.processOutboxEvents();

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(kafkaService.publish).toHaveBeenCalledWith('payments.events.v1', {
      escrowId: 'escrow-1',
      status: 'RELEASED',
    });
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'evt-1' },
      data: {
        published: true,
        publishedAt: expect.any(Date),
        error: null,
      },
    });
  });

  it('should increment retryCount and record error on publish failure', async () => {
    const mockEvents = [
      {
        id: 'evt-2',
        topic: 'payments.events.v1',
        payload: JSON.stringify({ escrowId: 'escrow-2' }),
        retryCount: 1,
      },
    ];

    prisma.$queryRaw.mockResolvedValue(mockEvents);
    kafkaService.publish.mockRejectedValue(new Error('Kafka timeout'));
    prisma.outboxEvent.update.mockResolvedValue({});

    await service.processOutboxEvents();

    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'evt-2' },
      data: {
        retryCount: 2,
        lastRetryAt: expect.any(Date),
        error: 'Kafka timeout',
      },
    });
  });

  it('should handle empty outbox events list gracefully', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await service.processOutboxEvents();

    expect(kafkaService.publish).not.toHaveBeenCalled();
    expect(prisma.outboxEvent.update).not.toHaveBeenCalled();
  });
});
