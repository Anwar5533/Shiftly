import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../shared/types/authenticated-request';

import { TokenDenylistService } from './token-denylist.service';

/** Claims the identity-service puts in an access token. */
interface AccessTokenPayload {
  sub: string;
  email?: string;
  phone?: string;
  role: string;
  permissions?: string[];
  sessionId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private static readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly tokenDenylistService: TokenDenylistService,
  ) {
    // SECURITY: Fallback dev secret intentionally removed (CRITICAL-03).
    // JWT_ACCESS_SECRET MUST be set in the environment. The strategy fails at
    // construction if it is absent, preventing the gateway from accepting
    // tokens forged with a publicly known fallback.
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error(
        'FATAL: JWT_ACCESS_SECRET environment variable is not set. ' +
          'The API Gateway cannot start without a valid JWT secret.',
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'FATAL: JWT_ACCESS_SECRET must be at least 32 characters. ' +
          'Generate one with `openssl rand -hex 32`.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  /**
   * Runs only after the signature and expiry have been verified. Identity is
   * taken exclusively from the verified claims — never from request headers.
   */
  async validate(payload: AccessTokenPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.role) {
      JwtStrategy.logger.warn('Rejected token with missing sub/role claim');
      throw new UnauthorizedException('Malformed access token');
    }

    if (payload.sessionId || payload.sub) {
      const isRevoked = await this.tokenDenylistService.isRevoked(payload.sessionId, payload.sub);
      if (isRevoked) {
        JwtStrategy.logger.warn(
          `Rejected revoked access token for user ${payload.sub} (session ${payload.sessionId ?? 'unknown'})`,
        );
        throw new UnauthorizedException('Token has been revoked. Please log in again.');
      }
    }

    return {
      userId: payload.sub,
      role: payload.role,
      email: payload.email,
      permissions: payload.permissions ?? [],
      sessionId: payload.sessionId,
    };
  }
}
