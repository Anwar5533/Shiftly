import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
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

    it('should return true if no permissions are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      expect(guard.canActivate(mockContext)).toBe(true);

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should throw ForbiddenException if user has no permissions', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['READ_USER']);
      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Insufficient permissions',
      );
    });

    it('should return true if user has all required permissions', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['READ_USER', 'WRITE_USER']);
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
        user: { permissions: ['READ_USER', 'WRITE_USER', 'DELETE_USER'] },
      });
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should throw ForbiddenException with missing permissions if user lacks some', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(['READ_USER', 'WRITE_USER', 'DELETE_USER']);
      (mockContext.switchToHttp().getRequest as jest.Mock).mockReturnValue({
        user: { permissions: ['READ_USER'] },
      });

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Insufficient permissions. Missing: WRITE_USER, DELETE_USER',
      );
    });
  });
});
