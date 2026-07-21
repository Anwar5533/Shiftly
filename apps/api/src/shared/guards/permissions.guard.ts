import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayload } from '@shiftly/shared-types';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user?.permissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      const missing = requiredPermissions.filter(
        (p) => !user.permissions.includes(p),
      );
      throw new ForbiddenException(
        `Insufficient permissions. Missing: ${missing.join(', ')}`,
      );
    }

    return true;
  }
}
