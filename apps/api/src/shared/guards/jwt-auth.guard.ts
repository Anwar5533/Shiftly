import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as jwt from 'jsonwebtoken';

interface GuardRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    sub: string;
    userId: string;
    role: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<GuardRequest>();

    const xUserId = request.headers['x-user-id'];
    const xUserRole = request.headers['x-user-role'];

    if (xUserId && typeof xUserId === 'string') {
      request.user = {
        id: xUserId,
        sub: xUserId,
        userId: xUserId,
        role: typeof xUserRole === 'string' ? xUserRole : '',
      };
      return true;
    }

    const authHeader = request.headers.authorization;
    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Authentication required. Please log in.',
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(
        'Authentication required. Please log in.',
      );
    }

    try {
      const secret =
        process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only_change_me';
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      request.user = {
        id: payload.sub as string,
        sub: payload.sub as string,
        userId: payload.sub as string,
        role: payload.role as string,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
