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
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('sendOtp', () => {
    it('should call authService.sendOtp', async () => {
      await controller.sendOtp({ phone: '+1234567890' }, { ip: '127.0.0.1', headers: {} } as any);
      expect(authService.sendOtp).toHaveBeenCalledWith('+1234567890', undefined, undefined);
    });
  });

  describe('verifyOtp', () => {
    it('should return token and set cookie', async () => {
      authService.verifyOtp.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
        isNewUser: false,
      });

      const result = await controller.verifyOtp(
        { phone: '+1234567890', otp: '123456' },
        { ip: '127.0.0.1', headers: { 'user-agent': 'test-agent' } } as any,
        mockRes,
      );

      expect(authService.verifyOtp).toHaveBeenCalledWith(
        '+1234567890',
        '123456',
        '127.0.0.1',
        'test-agent',
        undefined,
        undefined
      );
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
      authService.registerWithEmail.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const result = await controller.register(
        { email: 'test@test.com', password: 'pass', role: 'WORKER' } as any,
        { ip: '127.0.0.1', headers: { 'user-agent': 'test-agent' } } as any,
        mockRes,
      );

      expect(authService.registerWithEmail).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result.accessToken).toBe('access');
    });
  });

  describe('login', () => {
    it('should return token and set cookie', async () => {
      authService.loginWithEmail.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 3600,
      });

      const result = await controller.login(
        { email: 'test@test.com', password: 'pass' },
        { ip: '127.0.0.1', headers: {} } as any,
        mockRes,
      );

      expect(authService.loginWithEmail).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result.accessToken).toBe('access');
    });
  });

  describe('refreshToken', () => {
    it('should throw error if cookie not present', async () => {
      await expect(
        controller.refreshToken({ cookies: {} } as any, mockRes),
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should clear cookie and logout', async () => {
      await controller.logout({ sessionId: 'sess-1', sub: 'user-1' } as any, { ip: '127.0.0.1', headers: {} } as any, mockRes);
      expect(authService.logout).toHaveBeenCalledWith('sess-1', 'user-1', '127.0.0.1', undefined, undefined);
      expect(mockRes.clearCookie).toHaveBeenCalled();
    });
  });
});
