import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@shiftly/shared-types';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: {} }),
        }),
      } as unknown as ExecutionContext;
    });

    it('should return true if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      expect(guard.canActivate(mockContext)).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should throw ForbiddenException if user object is not present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
        user: null,
      });
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow('Access denied');
    });

    it('should return true if user has required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'MANAGER']);
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
        user: { role: 'ADMIN' },
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should throw ForbiddenException with role details if user lacks role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['ADMIN', 'MANAGER']);
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
        user: { role: 'WORKER' },
      });

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        `Access denied. Required role: ADMIN or MANAGER. Your role: WORKER`,
      );
    });
  });
});
