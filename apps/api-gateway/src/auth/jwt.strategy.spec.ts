/* eslint-disable @typescript-eslint/unbound-method */
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { TokenDenylistService } from './token-denylist.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;
  let tokenDenylistService: jest.Mocked<TokenDenylistService>;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-jwt-secret-must-be-at-least-32-chars-long'),
    } as unknown as jest.Mocked<ConfigService>;

    tokenDenylistService = {
      isRevoked: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<TokenDenylistService>;

    strategy = new JwtStrategy(configService, tokenDenylistService);
  });

  it('should validate a valid token payload', async () => {
    const payload = {
      sub: 'user-123',
      role: 'WORKER',
      email: 'worker@test.com',
      sessionId: 'session-456',
      permissions: ['read:shifts'],
    };

    const user = await strategy.validate(payload);
    expect(user).toEqual({
      userId: 'user-123',
      role: 'WORKER',
      email: 'worker@test.com',
      sessionId: 'session-456',
      permissions: ['read:shifts'],
    });
    expect(tokenDenylistService.isRevoked).toHaveBeenCalledWith('session-456', 'user-123');
  });

  it('should throw UnauthorizedException if token has been revoked', async () => {
    tokenDenylistService.isRevoked.mockResolvedValue(true);

    const payload = {
      sub: 'user-123',
      role: 'WORKER',
      sessionId: 'revoked-session',
    };

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if sub or role is missing', async () => {
    await expect(strategy.validate({ sub: '', role: 'WORKER' })).rejects.toThrow(
      UnauthorizedException,
    );

    await expect(strategy.validate({ sub: 'user-123', role: '' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
