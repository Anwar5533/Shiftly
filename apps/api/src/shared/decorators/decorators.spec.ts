/* eslint-disable @typescript-eslint/no-unused-vars, prettier/prettier -- TODO(RC3): Address type safety */
import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { RequirePermissions, PERMISSIONS_KEY } from './permissions.decorator';
import { UserRole, JwtPayload } from '@shiftly/shared-types';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { Roles, ROLES_KEY } from './roles.decorator';

// Helper to get custom parameter decorators
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- TODO(RC3): Address type safety
function getParamDecoratorFactory(decorator: Function, ...argsToPass: any[]) {
  class Test {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
    public test(@decorator(...argsToPass) value: any) {}
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- TODO(RC3): Address type safety
  return args[Object.keys(args)[0]].factory;
}

describe('Decorators', () => {
  describe('CurrentUser Decorator', () => {
    it('should extract the whole user object if no data is provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      const factory = getParamDecoratorFactory(CurrentUser);

      const mockUser = { sub: '123', email: 'test@test.com' };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as unknown as ExecutionContext;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- TODO(RC3): Address type safety
      const result = factory(null, ctx);
      expect(result).toBe(mockUser);
    });

    it('should extract a specific field if data is provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      const factory = getParamDecoratorFactory(CurrentUser, 'email');

      const mockUser = { sub: '123', email: 'test@test.com' };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as unknown as ExecutionContext;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- TODO(RC3): Address type safety
      const result = factory('email', ctx);
      expect(result).toBe('test@test.com');
    });
  });

  describe('Permissions', () => {
    it('should set permissions metadata', () => {
      class TestClass {
        @RequirePermissions('READ_USER')
        testMethod() {}
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      const permissions = Reflect.getMetadata(
        PERMISSIONS_KEY,
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        TestClass.prototype.testMethod,
      );
      expect(permissions).toEqual(['READ_USER']);
    });
  });

  describe('Public', () => {
    it('should set public metadata', () => {
      class TestClass {
        @Public()
        testMethod() {}
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      const isPublic = Reflect.getMetadata(
        IS_PUBLIC_KEY,
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        TestClass.prototype.testMethod,
      );
      expect(isPublic).toBe(true);
    });
  });

  describe('Roles', () => {
    it('should set roles metadata', () => {
      class TestClass {
        @Roles('ADMIN', 'WORKER')
        testMethod() {}
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        // eslint-disable-next-line @typescript-eslint/unbound-method -- TODO(RC3): Address type safety
        TestClass.prototype.testMethod,
      );
      expect(roles).toEqual(['ADMIN', 'WORKER']);
    });
  });
});
