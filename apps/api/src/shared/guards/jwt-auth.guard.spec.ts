/* eslint-disable @typescript-eslint/no-unused-vars -- TODO(RC3): Address type safety */
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
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

    it('should call super.canActivate if route is not public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      // Mock the super.canActivate method
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(guard), 'canActivate')
        .mockReturnValue(true);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });

  describe('handleRequest', () => {
    it('should return user if no error and user exists', () => {
      const mockUser = { id: 1 };
      const result = guard.handleRequest(null as unknown as Error, mockUser);
      expect(result).toBe(mockUser);
    });

    it('should throw error if error exists', () => {
      const error = new Error('test error');
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });

    it('should throw UnauthorizedException if no user', () => {
      expect(() => guard.handleRequest(new Error('test'), null)).toThrow(
        'test',
      );
      expect(() => guard.handleRequest(null as unknown as Error, null)).toThrow(
        'Authentication required. Please log in.',
      );
    });
  });
});
