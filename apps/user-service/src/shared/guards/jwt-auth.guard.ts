import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
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

    // SECURITY: x-user-id / x-user-role header bypass has been intentionally
    // removed (CRITICAL-01). All identity claims MUST come from a verified
    // Bearer token; unauthenticated header values are never trusted.

    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Authentication required. Please log in.');
    }

    // SECURITY: The fallback dev secret has been intentionally removed
    // (CRITICAL-03). JWT_ACCESS_SECRET MUST be defined at startup; the service will
    // refuse to authenticate requests rather than silently use a known key.
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        'Server misconfiguration: JWT_ACCESS_SECRET environment variable is not set.',
      );
    }

    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      request.user = {
        id: payload.sub as string,
        sub: payload.sub as string,
        userId: payload.sub as string,
        role: payload.role as string,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
