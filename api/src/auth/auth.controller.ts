import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { z } from 'zod';
import type { Env } from '../config/env.js';
import type { AdminRequest } from '../security/admin.guard.js';
import { AdminGuard } from '../security/admin.guard.js';
import type { AdminRole } from './admin.entity.js';
import { AuthService, SignedIn } from './auth.service.js';
import { MIN_PASSWORD_LENGTH } from './passwords.js';
import { clearSessionCookie, CookieSettings, cookieSettings, sessionToken, setSessionCookie } from './session-cookie.js';

const passwordField = z.string().min(MIN_PASSWORD_LENGTH).max(200);
const signInSchema = z.object({
  email: z.string().min(3).max(254),
  password: z.string().min(1).max(200),
});
type SignInInput = z.infer<typeof signInSchema>;
const changePasswordSchema = z.object({
  current: z.string().min(1).max(200),
  next: passwordField,
});
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
const inviteSchema = z.object({ password: passwordField });
type InviteInput = z.infer<typeof inviteSchema>;
const secretSchema = z.string().regex(/^[\w-]{20,100}$/);

interface Me {
  readonly email: string | null;
  readonly role: AdminRole;
}

@Controller('auth')
export class AuthController {
  private readonly cookies: CookieSettings;

  constructor(
    private readonly auth: AuthService,
    config: ConfigService<Env, true>,
  ) {
    this.cookies = cookieSettings(config);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async signIn(
    @Body({ schema: signInSchema }) { email, password }: SignInInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Me> {
    return this.startSession(await this.auth.signIn(email, password), response);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@Req() { admin }: AdminRequest): Me {
    return { email: admin?.email ?? null, role: admin?.role ?? 'super' };
  }

  @Post('logout')
  @HttpCode(204)
  async signOut(
    @Req() request: AdminRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const token = sessionToken(request);
    if (token) {
      await this.auth.signOut(token);
    }
    clearSessionCookie(response, this.cookies);
  }

  @Post('password')
  @HttpCode(204)
  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async changePassword(
    @Req() request: AdminRequest,
    @Body({ schema: changePasswordSchema })
    { current, next }: ChangePasswordInput,
  ): Promise<void> {
    const token = sessionToken(request);
    if (
      !request.admin ||
      !token ||
      !(await this.auth.changePassword(request.admin, current, next, token))
    ) {
      throw new UnauthorizedException('Wrong password');
    }
  }

  @Get('invite/:secret')
  @Throttle({ default: { limit: 20, ttl: 15 * 60_000 } })
  async invite(
    @Param('secret', { schema: secretSchema }) secret: string,
  ): Promise<{ email: string }> {
    const admin = await this.auth.adminForInvite(secret);
    if (!admin) {
      throw new NotFoundException();
    }
    return { email: admin.email };
  }

  @Post('invite/:secret')
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async acceptInvite(
    @Param('secret', { schema: secretSchema }) secret: string,
    @Body({ schema: inviteSchema }) { password }: InviteInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Me> {
    const signedIn = await this.auth.acceptInvite(secret, password);
    if (!signedIn) {
      throw new NotFoundException();
    }
    return this.startSession(signedIn, response);
  }

  private startSession(signedIn: SignedIn | null, response: Response): Me {
    if (!signedIn) {
      throw new UnauthorizedException('Wrong email or password');
    }
    setSessionCookie(response, signedIn.token, signedIn.expires, this.cookies);
    return { email: signedIn.admin.email, role: signedIn.admin.role };
  }
}
