/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { OutboxService } from './outbox.service';
import { PrismaService } from '../database/prisma.service';
import { KafkaService } from '../kafka/kafka.service';

describe('OutboxService', () => {
  let service: OutboxService;
  let prisma: any;
  let kafkaService: any;

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(async (callback: (tx: any) => Promise<unknown>) => {
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

  it('should process unpublished events and mark them published on success', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        topic: 'jobs.events.v1',
        payload: { shiftId: 'shift-1' },
        retryCount: 0,
      },
    ];

    prisma.$queryRaw.mockResolvedValue(mockEvents);
    kafkaService.publish.mockResolvedValue(undefined);
    prisma.outboxEvent.update.mockResolvedValue({});

    await service.processOutboxEvents();

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(kafkaService.publish).toHaveBeenCalledWith('jobs.events.v1', { shiftId: 'shift-1' });
    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: {
        published: true,
        publishedAt: expect.any(Date),
        error: null,
      },
    });
  });

  it('should increment retryCount and record error on Kafka publish failure', async () => {
    const mockEvents = [
      {
        id: 'event-2',
        topic: 'jobs.events.v1',
        payload: JSON.stringify({ shiftId: 'shift-2' }),
        retryCount: 1,
      },
    ];

    prisma.$queryRaw.mockResolvedValue(mockEvents);
    kafkaService.publish.mockRejectedValue(new Error('Broker unreachable'));
    prisma.outboxEvent.update.mockResolvedValue({});

    await service.processOutboxEvents();

    expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'event-2' },
      data: {
        retryCount: 2,
        lastRetryAt: expect.any(Date),
        error: 'Broker unreachable',
      },
    });
  });

  it('should do nothing if no events are found', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    await service.processOutboxEvents();

    expect(kafkaService.publish).not.toHaveBeenCalled();
    expect(prisma.outboxEvent.update).not.toHaveBeenCalled();
  });
});
