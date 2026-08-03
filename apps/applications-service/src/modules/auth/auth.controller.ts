import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { Public } from '../../shared/decorators/public.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtPayload } from '@shiftly/shared-types';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.get<boolean>('app.cookieSecure', true),
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
      domain: this.config.get<string>('app.cookieDomain'),
    };
  }

  // ─── OTP Flow ─────────────────────────────────────────────────────────────

  @Post('otp/send')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiOkResponse({ description: 'OTP sent successfully' })
  async sendOtp(
    @Body() dto: SendOtpDto,
    @Req() req: Request,
  ): Promise<{ message: string; expiresIn: number }> {
    await this.authService.sendOtp(
      dto.phone,
      req.headers['x-request-id'] as string,
      req.headers['x-correlation-id'] as string,
    );
    return {
      message: 'OTP sent successfully',
      expiresIn: 300,
    };
  }

  @Post('otp/verify')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and receive access token' })
  @ApiOkResponse({ description: 'OTP verified, tokens issued' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; expiresIn: number; isNewUser: boolean }> {
    const result = await this.authService.verifyOtp(
      dto.phone,
      dto.otp,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
      req.headers['x-request-id'] as string,
      req.headers['x-correlation-id'] as string,
    );
    res.cookie('refresh_token', result.refreshToken, this.getCookieOptions());
    return {
      accessToken: result.accessToken,
      expiresIn: result.expiresIn,
      isNewUser: result.isNewUser,
    };
  }

  // ─── Email/Password Flow ──────────────────────────────────────────────────

  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'Register with email and password (Employer/Recruiter)',
  })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  async register(
    @Body() dto: RegisterEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const result = await this.authService.registerWithEmail(
      dto,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
      req.headers['x-request-id'] as string,
      req.headers['x-correlation-id'] as string,
    );
    res.cookie('refresh_token', result.refreshToken, this.getCookieOptions());
    return { accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ description: 'Login successful' })
  async login(
    @Body() dto: LoginEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const result = await this.authService.loginWithEmail(
      dto.email,
      dto.password,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
      req.headers['x-request-id'] as string,
      req.headers['x-correlation-id'] as string,
    );
    res.cookie('refresh_token', result.refreshToken, this.getCookieOptions());
    return { accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  // ─── Token Management ─────────────────────────────────────────────────────

  @Post('refresh-token')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
  @ApiOkResponse({ description: 'New tokens issued' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const result = await this.authService.refreshTokens(
      refreshToken,
      req.ip ?? '',
      req.headers['user-agent'] ?? '',
      req.headers['x-request-id'] as string,
      req.headers['x-correlation-id'] as string,
    );
    res.cookie('refresh_token', result.refreshToken, this.getCookieOptions());
    return { accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  @Delete('session')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout — revoke current session' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(
      user.sessionId,
      user.sub,
      req.ip ?? '',
      req.headers['x-request-id'] as string,
      req.headers['x-correlation-id'] as string,
    );
    res.clearCookie('refresh_token', { path: '/api/v1/auth' });
  }
}
