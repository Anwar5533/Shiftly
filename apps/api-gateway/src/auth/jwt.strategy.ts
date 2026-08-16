/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>(
      'JWT_ACCESS_SECRET',
      'fallback_secret_key_for_dev_only_change_me',
    );
    console.log('API Gateway JwtStrategy initialized with secret:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: any) {
    console.log('API Gateway JwtStrategy validating payload:', payload);
    // Return the subset of JWT payload data that we want to attach to req.user
    return { userId: payload.sub, role: payload.role };
  }
}
