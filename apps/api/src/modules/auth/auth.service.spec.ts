/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import {
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let redis: any;
  let jwt: any;
  let config: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      auditLog: { create: jest.fn() },
      otpToken: { create: jest.fn() },

      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      } as any,

      refreshToken: {
        create: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
      } as any,

      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn(),
      } as any,
      $transaction: jest.fn((arg) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- TODO(RC3): Address type safety
        return arg(prisma);
      }),
    };

    redis = {
      exists: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    };

    jwt = {
      signAsync: jest.fn().mockResolvedValue('test-jwt-token'),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    config = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'app.otpExpireSeconds') return 300;
        if (key === 'app.otpMaxAttempts') return 5;
        if (key === 'app.otpLockoutSeconds') return 900;
        if (key === 'jwt.expiresIn') return 3600;
        if (key === 'jwt.refreshExpiresIn') return 604800;
        return null;
      }),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        { provide: PrismaService, useValue: prisma },

        { provide: RedisService, useValue: redis },

        { provide: JwtService, useValue: jwt },

        { provide: ConfigService, useValue: config },

        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should throw BadRequestException if account is locked', async () => {
      redis.exists.mockResolvedValue(1);
      await expect(service.sendOtp('+1234567890')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should send OTP and store it in redis and db', async () => {
      redis.exists.mockResolvedValue(0);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-otp');

      await service.sendOtp('+1234567890');

      expect(redis.set).toHaveBeenCalledWith(
        'otp:+1234567890',
        expect.any(String),
        300,
      );

      expect(prisma.otpToken.create).toHaveBeenCalled();

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.send-sms',
        expect.any(Object),
      );
    });
  });

  describe('verifyOtp', () => {
    it('should throw BadRequestException if locked', async () => {
      redis.exists.mockResolvedValue(1);

      await expect(
        service.verifyOtp('+1234567890', '123456', '127.0.0.1', 'test'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP expired', async () => {
      redis.exists.mockResolvedValue(0);

      redis.get.mockResolvedValue(null);

      await expect(
        service.verifyOtp('+1234567890', '123456', '127.0.0.1', 'test'),
      ).rejects.toThrow('OTP has expired');
    });

    it('should throw BadRequestException if OTP is incorrect and lock if attempts exceed', async () => {
      redis.exists.mockResolvedValue(0);

      redis.get.mockResolvedValue('654321');

      redis.incr.mockResolvedValue(5);

      await expect(
        service.verifyOtp('+1234567890', '123456', '127.0.0.1', 'test'),
      ).rejects.toThrow('Too many failed attempts');

      expect(redis.set).toHaveBeenCalledWith(
        'otp:lockout:+1234567890',
        '1',
        900,
      );
    });

    it('should verify OTP successfully and create a new user if not exists', async () => {
      redis.exists.mockResolvedValue(0);

      redis.get.mockResolvedValue('123456');

      prisma.user.findUnique.mockResolvedValue(null);

      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        role: 'WORKER',
      } as any);

      const result = await service.verifyOtp(
        '+1234567890',
        '123456',
        '127.0.0.1',
        'test',
      );

      expect(result.isNewUser).toBe(true);
      expect(result.accessToken).toBe('test-jwt-token');

      expect(redis.del).toHaveBeenCalledWith('otp:+1234567890');
    });

    it('should verify OTP successfully for existing user', async () => {
      redis.exists.mockResolvedValue(0);

      redis.get.mockResolvedValue('123456');

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'WORKER',
      } as any);

      const result = await service.verifyOtp(
        '+1234567890',
        '123456',
        '127.0.0.1',
        'test',
      );

      expect(result.isNewUser).toBe(false);
      expect(result.accessToken).toBe('test-jwt-token');
    });
  });

  describe('registerWithEmail', () => {
    it('should throw ConflictException if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' } as any);
      await expect(
        service.registerWithEmail(
          {
            email: 'test@test.com',

            password: 'pass',

            role: 'WORKER',
          } as any,
          '127.0.0.1',
          'test',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should register successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');

      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        role: 'WORKER',
      } as any);

      const result = await service.registerWithEmail(
        {
          email: 'test@test.com',

          password: 'pass',

          role: 'WORKER',
        } as any,
        '127.0.0.1',
        'test',
      );
      expect(result.accessToken).toBe('test-jwt-token');
    });
  });

  describe('loginWithEmail', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.loginWithEmail('test@test.com', 'pass', {} as any, {} as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        passwordHash: 'hash',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.loginWithEmail('test@test.com', 'pass', {} as any, {} as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        passwordHash: 'hash',
        role: 'WORKER',
      } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.loginWithEmail(
        'test@test.com',
        'pass',

        {} as any,

        {} as any,
      );
      expect(result.accessToken).toBe('test-jwt-token');
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException if token invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });
      await expect(service.refreshTokens('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should refresh token successfully', async () => {
      jwt.verify.mockReturnValue({ sessionId: 'sess-1' });

      prisma.session.findFirst.mockResolvedValue({
        userId: 'user-1',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 10000),
        user: { id: 'user-1', status: 'ACTIVE' },
      });

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'WORKER',
      } as any);

      const result = await service.refreshTokens('test-refresh-token');
      expect(result.accessToken).toBe('test-jwt-token');
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for user', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- TODO(RC3): Address type safety
      const crypto = require('crypto');

      const hashedJti = crypto
        .createHash('sha256')
        .update('user-1')
        .digest('hex');
      await service.logout('user-1', '127.0.0.1');

      expect(prisma.session.updateMany).toHaveBeenCalledWith({
        where: { refreshTokenJti: hashedJti },

        data: { isRevoked: true, revokedAt: expect.any(Date) },
      });
    });
  });
});
