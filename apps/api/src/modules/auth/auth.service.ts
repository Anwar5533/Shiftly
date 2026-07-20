import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RegisterEmailDto } from './dto/register-email.dto';
import { ROLE_PERMISSIONS } from '@shiftly/shared-constants';
import { JwtPayload } from '@shiftly/shared-types';
import { User, UserRole } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../../events/definitions/user-registered.event';

interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface OtpVerifyResult extends TokenSet {
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_KEY = (phone: string) => `otp:${phone}`;
  private readonly OTP_ATTEMPTS_KEY = (phone: string) => `otp:attempts:${phone}`;
  private readonly LOCKOUT_KEY = (phone: string) => `otp:lockout:${phone}`;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── OTP ───────────────────────────────────────────────────────────────────

  async sendOtp(phone: string): Promise<void> {
    // Check lockout
    const isLocked = await this.redis.exists(this.LOCKOUT_KEY(phone));
    if (isLocked) {
      throw new BadRequestException(
        'Too many OTP attempts. Please wait 15 minutes before requesting a new OTP.',
      );
    }

    // Generate 6-digit OTP (Static '123456' for local development, random otherwise)
    const isDev = process.env.NODE_ENV !== 'production';
    const otp = isDev ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expirySeconds = this.config.get<number>('app.otpExpireSeconds', 300);

    // Store OTP in Redis
    await this.redis.set(this.OTP_KEY(phone), otp, expirySeconds);

    // Store in DB for audit trail
    await this.prisma.otpToken.create({
      data: {
        phone,
        code: await bcrypt.hash(otp, 10),
        expiresAt: new Date(Date.now() + expirySeconds * 1000),
      },
    });

    // Emit event for SMS sending (handled by NotificationsModule)
    this.eventEmitter.emit('notification.send-sms', {
      phone,
      message: `Your SHIFTLY verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`,
    });

    this.logger.log(`OTP sent to ${phone.slice(0, 6)}**** (DEV ONLY: OTP is ${otp})`);
  }

  async verifyOtp(phone: string, otp: string): Promise<OtpVerifyResult> {
    // Check lockout
    const isLocked = await this.redis.exists(this.LOCKOUT_KEY(phone));
    if (isLocked) {
      throw new BadRequestException('Account temporarily locked due to too many failed attempts.');
    }

    // Validate OTP from Redis
    const storedOtp = await this.redis.get(this.OTP_KEY(phone));
    if (!storedOtp) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (storedOtp !== otp) {
      // Increment attempt counter
      const attempts = await this.redis.incr(this.OTP_ATTEMPTS_KEY(phone));
      const maxAttempts = this.config.get<number>('app.otpMaxAttempts', 5);

      if (attempts >= maxAttempts) {
        await this.redis.set(this.LOCKOUT_KEY(phone), '1', 900); // 15 min lockout
        await this.redis.del(this.OTP_KEY(phone));
        await this.redis.del(this.OTP_ATTEMPTS_KEY(phone));
        throw new BadRequestException(
          'Too many failed attempts. Account locked for 15 minutes.',
        );
      }

      throw new BadRequestException(
        `Invalid OTP. ${maxAttempts - attempts} attempts remaining.`,
      );
    }

    // Clear OTP + attempt counters
    await Promise.all([
      this.redis.del(this.OTP_KEY(phone)),
      this.redis.del(this.OTP_ATTEMPTS_KEY(phone)),
    ]);

    // Upsert user
    let user = await this.prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          role: UserRole.WORKER,
          isPhoneVerified: true,
          wallet: { create: { currency: 'INR' } },
          referralCode: { create: { code: this.generateReferralCode() } },
          subscription: {
            create: {
              plan: 'FREE',
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });

      this.eventEmitter.emit('auth.user-registered', new UserRegisteredEvent(user));
    }

    this.validateUserStatus(user);

    const tokens = await this.generateTokens(user);
    return { ...tokens, isNewUser };
  }

  // ─── Email/Password ────────────────────────────────────────────────────────

  async registerWithEmail(dto: RegisterEmailDto): Promise<TokenSet> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(
        'An account with this email address already exists.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role as UserRole,
        wallet: { create: { currency: 'INR' } },
        referralCode: { create: { code: this.generateReferralCode() } },
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
        },
        ...(dto.role === 'EMPLOYER'
          ? { employerProfile: { create: { companyName: '', industry: '', location: {} } } }
          : { recruiterProfile: { create: { firstName: dto.firstName, lastName: dto.lastName } } }),
      },
    });

    this.eventEmitter.emit('auth.user-registered', new UserRegisteredEvent(user));

    return this.generateTokens(user);
  }

  async loginWithEmail(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<TokenSet> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    this.validateUserStatus(user);

    // Update login metadata
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginCount: { increment: 1 } },
    });

    return this.generateTokens(user, ipAddress, userAgent);
  }

  // ─── Token Management ──────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<TokenSet> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshTokenSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token. Please log in again.');
    }

    // Validate session still exists and not revoked
    const session = await this.prisma.session.findFirst({
      where: { refreshTokenJti: payload.sessionId, isRevoked: false },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired. Please log in again.');
    }

    this.validateUserStatus(session.user);

    // Rotate: revoke old session, create new one
    await this.prisma.session.update({
      where: { id: session.id },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return this.generateTokens(session.user);
  }

  async logout(sessionId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { refreshTokenJti: sessionId },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  // ─── JWT Strategy Validation ───────────────────────────────────────────────

  async validateJwtPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status === 'DELETED' || user.status === 'SUSPENDED') {
      return null;
    }
    return user;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private async generateTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenSet> {
    const jti = uuidv4();
    const permissions = ROLE_PERMISSIONS[user.role] ?? [];

    const accessPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload['role'],
      permissions,
      sessionId: jti,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.config.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.config.get<string>('jwt.accessTokenExpiresIn', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: user.id, sessionId: jti },
        {
          secret: this.config.get<string>('jwt.refreshTokenSecret'),
          expiresIn: this.config.get<string>('jwt.refreshTokenExpiresIn', '7d'),
        },
      ),
    ]);

    // Persist session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenJti: jti,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private validateUserStatus(user: User): void {
    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact support.',
      );
    }
    if (user.status === 'DELETED') {
      throw new ForbiddenException('Account not found.');
    }
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
