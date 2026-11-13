import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { z } from 'zod';
import { clearSessionCookie, CookieSettings, cookieSettings, readCookie, setSessionCookie } from '../auth/session-cookie.js';
import type { Env } from '../config/env.js';
import type { AppId } from '../shared/apps.js';
import { appSchema, playerCookie } from '../shared/apps.js';
import { Account, accountView, FEW_PER_15_MINUTES, FEW_PER_HOUR, playerOf } from './account-view.js';
import { changePasswordSchema, deleteSchema, forgotSchema, registerSchema, resetSchema, secretSchema, signInSchema } from './accounts.schema.js';
import type { ChangePasswordInput, RegisterInput, SignInInput } from './accounts.schema.js';
import { AccountsService, PlayerSignedIn } from './accounts.service.js';
import type { PlayerRequest } from './player.guard.js';
import { PlayerGuard } from './player.guard.js';
import { ResultsService } from './results.service.js';

@Controller('v1/apps/:app/account')
export class PlayerSignInController {
  private readonly cookies: CookieSettings;

  constructor(
    private readonly accounts: AccountsService,
    private readonly results: ResultsService,
    config: ConfigService<Env, true>,
  ) {
    this.cookies = cookieSettings(config);
  }

  @Get('options')
  options(@Param('app', { schema: appSchema }) _app: AppId): {
    email: boolean;
  } {
    return { email: this.accounts.canEmail };
  }

  @Post()
  @Throttle(FEW_PER_HOUR)
  async register(
    @Param('app', { schema: appSchema }) app: AppId,
    @Body({ schema: registerSchema }) input: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Account> {
    return this.startSession(
      app,
      await this.accounts.register(app, input),
      response,
    );
  }

  @Post('login')
  @Throttle(FEW_PER_15_MINUTES)
  async signIn(
    @Param('app', { schema: appSchema }) app: AppId,
    @Body({ schema: signInSchema }) { loginName, password }: SignInInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Account> {
    const signedIn = await this.accounts.signIn(app, loginName, password);
    if (!signedIn) {
      throw new UnauthorizedException('wrong-login');
    }
    return this.startSession(app, signedIn, response);
  }

  @Post('logout')
  @HttpCode(204)
  async signOut(
    @Param('app', { schema: appSchema }) app: AppId,
    @Req() request: PlayerRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const token = readCookie(request, playerCookie(app));
    if (token) {
      await this.accounts.signOut(token);
    }
    clearSessionCookie(response, this.cookies, playerCookie(app));
  }

  @Post('password')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async changePassword(
    @Param('app', { schema: appSchema }) app: AppId,
    @Req() request: PlayerRequest,
    @Body({ schema: changePasswordSchema })
    { current, next }: ChangePasswordInput,
  ): Promise<void> {
    const token = readCookie(request, playerCookie(app)) ?? '';
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

  @Post('forgot')
  @HttpCode(204)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  async forgot(
    @Param('app', { schema: appSchema }) app: AppId,
    @Body({ schema: forgotSchema }) { email }: z.infer<typeof forgotSchema>,
  ): Promise<void> {
    await this.accounts.forgot(app, email);
  }

  @Post('reset/:secret')
  @Throttle(FEW_PER_15_MINUTES)
  async reset(
    @Param('app', { schema: appSchema }) app: AppId,
    @Param('secret', { schema: secretSchema }) secret: string,
    @Body({ schema: resetSchema }) { password }: z.infer<typeof resetSchema>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Account> {
    const signedIn = await this.accounts.reset(app, secret, password);
    if (!signedIn) {
      throw new NotFoundException();
    }
    return this.startSession(app, signedIn, response);
  }

  @Delete()
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async remove(
    @Param('app', { schema: appSchema }) app: AppId,
    @Req() request: PlayerRequest,
    @Body({ schema: deleteSchema }) { password }: z.infer<typeof deleteSchema>,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    if (!(await this.accounts.remove(playerOf(request), password))) {
      throw new UnauthorizedException('wrong-password');
    }
    clearSessionCookie(response, this.cookies, playerCookie(app));
  }

  private async startSession(
    app: AppId,
    { player, token, expires }: PlayerSignedIn,
    response: Response,
  ): Promise<Account> {
    setSessionCookie(response, token, expires, this.cookies, playerCookie(app));
    return accountView(player, this.results);
  }
}
