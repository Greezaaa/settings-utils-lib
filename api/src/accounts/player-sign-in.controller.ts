import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { z } from 'zod';
import {
  clearSessionCookie,
  CookieSettings,
  cookieSettings,
  PLAYER_COOKIE,
  readCookie,
  setSessionCookie,
} from '../auth/session-cookie.js';
import type { Env } from '../config/env.js';
import {
  Account,
  accountView,
  FEW_PER_15_MINUTES,
  FEW_PER_HOUR,
  playerOf,
} from './account-view.js';
import {
  changePasswordSchema,
  deleteSchema,
  forgotSchema,
  registerSchema,
  resetSchema,
  secretSchema,
  signInSchema,
} from './accounts.schema.js';
import type {
  ChangePasswordInput,
  RegisterInput,
  SignInInput,
} from './accounts.schema.js';
import { AccountsService, PlayerSignedIn } from './accounts.service.js';
import type { PlayerRequest } from './player.guard.js';
import { PlayerGuard } from './player.guard.js';
import { ResultsService } from './results.service.js';

/**
 * Players' sign-in on auth.su-labs.dev: sign up with a login name, a password and a screen name (an email only to
 * reset a forgotten password), sign in on any device, sign out, change or reset the password, and delete the account.
 * The session cookie it sets reaches api.su-labs.dev too, where the account's data is (AccountsController).
 */
@Controller('v1/account')
export class PlayerSignInController {
  private readonly cookies: CookieSettings;

  constructor(
    private readonly accounts: AccountsService,
    private readonly results: ResultsService,
    config: ConfigService<Env, true>,
  ) {
    this.cookies = cookieSettings(config);
  }

  /** What the sign-up form may offer: an email only when the API can send emails */
  @Get('options')
  options(): { email: boolean } {
    return { email: this.accounts.canEmail };
  }

  @Post()
  @Throttle(FEW_PER_HOUR)
  async register(
    @Body({ schema: registerSchema }) input: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Account> {
    return this.startSession(await this.accounts.register(input), response);
  }

  /** Signs in with the login name (or the email, when the account has one) */
  @Post('login')
  @Throttle(FEW_PER_15_MINUTES)
  async signIn(
    @Body({ schema: signInSchema }) { loginName, password }: SignInInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Account> {
    const signedIn = await this.accounts.signIn(loginName, password);
    if (!signedIn) {
      throw new UnauthorizedException('wrong-login');
    }
    return this.startSession(signedIn, response);
  }

  @Post('logout')
  @HttpCode(204)
  async signOut(
    @Req() request: PlayerRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const token = readCookie(request, PLAYER_COOKIE);
    if (token) {
      await this.accounts.signOut(token);
    }
    clearSessionCookie(response, this.cookies, PLAYER_COOKIE);
  }

  @Post('password')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async changePassword(
    @Req() request: PlayerRequest,
    @Body({ schema: changePasswordSchema })
    { current, next }: ChangePasswordInput,
  ): Promise<void> {
    const token = readCookie(request, PLAYER_COOKIE) ?? '';
    if (
      !(await this.accounts.changePassword(
        playerOf(request),
        current,
        next,
        token,
      ))
    ) {
      throw new UnauthorizedException('wrong-password');
    }
  }

  /** Emails a reset link when an account has this email; always the same answer, so it tells nobody who has one */
  @Post('forgot')
  @HttpCode(204)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  async forgot(
    @Body({ schema: forgotSchema }) { email }: z.infer<typeof forgotSchema>,
  ): Promise<void> {
    await this.accounts.forgot(email);
  }

  @Post('reset/:secret')
  @Throttle(FEW_PER_15_MINUTES)
  async reset(
    @Param('secret', { schema: secretSchema }) secret: string,
    @Body({ schema: resetSchema }) { password }: z.infer<typeof resetSchema>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Account> {
    const signedIn = await this.accounts.reset(secret, password);
    if (!signedIn) {
      throw new NotFoundException();
    }
    return this.startSession(signedIn, response);
  }

  /** Deletes the account and everything in it */
  @Delete()
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async remove(
    @Req() request: PlayerRequest,
    @Body({ schema: deleteSchema }) { password }: z.infer<typeof deleteSchema>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    if (!(await this.accounts.remove(playerOf(request), password))) {
      throw new UnauthorizedException('wrong-password');
    }
    clearSessionCookie(response, this.cookies, PLAYER_COOKIE);
  }

  private async startSession(
    { player, token, expires }: PlayerSignedIn,
    response: Response,
  ): Promise<Account> {
    setSessionCookie(response, token, expires, this.cookies, PLAYER_COOKIE);
    return accountView(player, this.results);
  }
}
