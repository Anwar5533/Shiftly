import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { RequirePermissions, PERMISSIONS_KEY } from './permissions.decorator';
import { UserRole, JwtPayload } from '@shiftly/shared-types';
import { Public, IS_PUBLIC_KEY } from './public.decorator';
import { Roles, ROLES_KEY } from './roles.decorator';

// Helper to get custom parameter decorators
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

function getParamDecoratorFactory(decorator: Function, ...argsToPass: any[]) {
  class Test {
    public test(@decorator(...argsToPass) value: any) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe('Decorators', () => {
  describe('CurrentUser Decorator', () => {
    it('should extract the whole user object if no data is provided', () => {
      const factory = getParamDecoratorFactory(CurrentUser);
      
      const mockUser = { sub: '123', email: 'test@test.com' };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as unknown as ExecutionContext;
      
      const result = factory(null, ctx);
      expect(result).toBe(mockUser);
    });
    
    it('should extract a specific field if data is provided', () => {
      const factory = getParamDecoratorFactory(CurrentUser, 'email');
      
      const mockUser = { sub: '123', email: 'test@test.com' };
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user: mockUser }),
        }),
      } as unknown as ExecutionContext;
      
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
      
      const permissions = Reflect.getMetadata(PERMISSIONS_KEY, TestClass.prototype.testMethod);
      expect(permissions).toEqual(['READ_USER']);
    });
  });

  describe('Public', () => {
    it('should set public metadata', () => {
      class TestClass {
        @Public()
        testMethod() {}
      }
      
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass.prototype.testMethod);
      expect(isPublic).toBe(true);
    });
  });

  describe('Roles', () => {
    it('should set roles metadata', () => {
      class TestClass {
        @Roles('ADMIN' as UserRole, 'WORKER' as UserRole)
        testMethod() {}
      }
      
      const roles = Reflect.getMetadata(ROLES_KEY, TestClass.prototype.testMethod);
      expect(roles).toEqual(['ADMIN', 'WORKER']);
    });
  });
});
