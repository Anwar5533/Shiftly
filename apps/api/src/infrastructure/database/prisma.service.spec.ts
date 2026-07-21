import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('PrismaService', () => {
  let service: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('development'),
          },
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock the connect/disconnect functions of PrismaClient
    service.$connect = jest.fn();
    service.$disconnect = jest.fn();
    service.$transaction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Constructor (Logging)', () => {
    it('should log slow queries', () => {
      // We can manually call the event handler if we spy on it during a new instantiation
      // Or we can just spy on PrismaClient.prototype.$on before instantiation
      const onSpy = jest
        .spyOn(require('@prisma/client').PrismaClient.prototype, '$on')
        .mockImplementation();

      const newService = new PrismaService(configService);
      expect(onSpy).toHaveBeenCalledWith('query', expect.any(Function));

      const callback = onSpy.mock.calls[0][1] as any;

      // Spy on logger
      const loggerSpy = jest
        .spyOn((newService as any).logger, 'warn')
        .mockImplementation();

      // Trigger with fast query
      callback({ query: 'SELECT 1', duration: 50 });
      expect(loggerSpy).not.toHaveBeenCalled();

      // Trigger with slow query
      callback({ query: 'SELECT 1', duration: 150 });
      expect(loggerSpy).toHaveBeenCalledWith('Slow query (150ms): SELECT 1');

      onSpy.mockRestore();
    });
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      await service.onModuleInit();
      expect(service.$connect).toHaveBeenCalled();
    });

    it('should throw an error if connection fails', async () => {
      (service.$connect as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed'),
      );
      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from the database', async () => {
      await service.onModuleDestroy();
      expect(service.$disconnect).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt for a given model and id', async () => {
      const mockUpdate = jest.fn();
      (service as any).user = { update: mockUpdate };

      await service.softDelete('user', '123');

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('executeTransaction', () => {
    it('should execute a transaction', async () => {
      const mockTx = {};
      const mockFn = jest.fn().mockResolvedValue('result');
      (service.$transaction as jest.Mock).mockImplementation(async (cb) => {
        return cb(mockTx);
      });

      const result = await service.executeTransaction(mockFn);

      expect(mockFn).toHaveBeenCalledWith(mockTx);
      expect(result).toBe('result');
    });
  });
});
