/* eslint-disable prettier/prettier -- TODO(RC3): Address type safety */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;
  let mockRes: any;

  beforeEach(async () => {
    authService = {
      sendOtp: jest.fn(),
      verifyOtp: jest.fn(),
      registerWithEmail: jest.fn(),
      loginWithEmail: jest.fn(),
      logout: jest.fn(),
    };

    mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'auth.cookieDomain') return 'localhost';
        if (key === 'auth.cookieSecure') return true;
        if (key === 'auth.cookieSameSite') return 'none';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('sendOtp', () => {
    it('should call authService.sendOtp', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await controller.sendOtp({ phone: '+1234567890' }, {
        ip: '127.0.0.1',
        headers: {},
      } as any);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(authService.sendOtp).toHaveBeenCalledWith(
        '+1234567890',
        undefined,
        undefined,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should return token and set cookie', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      authService.verifyOtp.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
        isNewUser: false,
      });

      const result = await controller.verifyOtp(
        { phone: '+1234567890', otp: '123456' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        { ip: '127.0.0.1', headers: { 'user-agent': 'test-agent' } } as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        mockRes,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(authService.verifyOtp).toHaveBeenCalledWith(
        '+1234567890',
        '123456',
        '127.0.0.1',
        'test-agent',
        undefined,

        undefined,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.any(Object),
      );
      expect(result.accessToken).toBe('access');
    });
  });

  describe('register', () => {
    it('should return token and set cookie', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      authService.registerWithEmail.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const result = await controller.register(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        { email: 'test@test.com', password: 'pass', role: 'WORKER' } as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        { ip: '127.0.0.1', headers: { 'user-agent': 'test-agent' } } as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        mockRes,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(authService.registerWithEmail).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result.accessToken).toBe('access');
    });
  });

  describe('login', () => {
    it('should return token and set cookie', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      authService.loginWithEmail.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const result = await controller.login(
        { email: 'test@test.com', password: 'pass' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        { ip: '127.0.0.1', headers: {} } as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        mockRes,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(authService.loginWithEmail).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result.accessToken).toBe('access');
    });
  });

  describe('refreshToken', () => {
    it('should throw error if cookie not present', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
        controller.refreshToken({ cookies: {} } as any, mockRes),
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should clear cookie and logout', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
      await controller.logout(
        { sessionId: 'sess-1', sub: 'user-1' } as any,
        { ip: '127.0.0.1', headers: {} } as any,
        mockRes,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(authService.logout).toHaveBeenCalledWith(
        'sess-1',
        'user-1',
        '127.0.0.1',
        undefined,
        undefined,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      expect(mockRes.clearCookie).toHaveBeenCalled();
    });
  });
});
