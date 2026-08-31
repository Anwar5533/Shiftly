import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('canActivate', () => {
    it('should return true if route is public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should throw UnauthorizedException if x-user-id header is provided without a Bearer token', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockRequest = {
        headers: {
          'x-user-id': 'user123',
          'x-user-role': 'admin',
        },
        user: undefined,
      };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if no valid headers are provided', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockRequest = {
        headers: {},
      };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    it('should verify token and set user if valid Bearer token is provided', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid_token',
        },
        user: undefined,
      };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'user456', role: 'user' } as any);

      expect(guard.canActivate(context)).toBe(true);
      expect(mockRequest.user).toEqual({
        id: 'user456',
        sub: 'user456',
        userId: 'user456',
        role: 'user',
      });
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid_token',
        },
      };
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });
});
