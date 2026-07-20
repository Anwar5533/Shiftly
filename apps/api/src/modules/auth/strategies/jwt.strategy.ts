import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '@shiftly/shared-types';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessTokenSecret') ?? '',
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user: User | null = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException('User account is inactive or not found.');
    }
    // Return payload (not user) — this is what @CurrentUser() receives
    return payload;
  }
}
