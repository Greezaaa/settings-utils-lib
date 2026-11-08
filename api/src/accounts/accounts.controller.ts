import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
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
  PLAYER_COOKIE,
  readCookie,
  setSessionCookie,
} from '../auth/session-cookie.js';
import type { Env } from '../config/env.js';
import type { ResultGame } from '../shared/catalog.js';
import { resultGameSchema } from '../shared/catalog.js';
import {
  bestsSchema,
  changePasswordSchema,
  changeSchema,
  deleteSchema,
  favoritesSchema,
  forgotSchema,
  registerSchema,
  resetSchema,
  resultSchema,
  secretSchema,
  signInSchema,
} from './accounts.schema.js';
import type {
  ChangeInput,
  ChangePasswordInput,
  RegisterInput,
  ResultInput,
  SignInInput,
} from './accounts.schema.js';
import { AccountsService, PlayerSignedIn } from './accounts.service.js';
import type { PlayerRequest } from './player.guard.js';
import { PlayerGuard } from './player.guard.js';
import type { Player } from './player.entity.js';
import { Leaderboard, MyResult, ResultsService } from './results.service.js';

/** The account as the games site sees it; the login name and email are only ever sent to their owner */
interface Account {
  readonly loginName: string;
  readonly screenName: string;
  readonly email: string | null;
  readonly favorites: string[];
  readonly results: MyResult[];
}

/** Sign-ups and sign-ins are rare: a few tries every 15 minutes or hour per visitor */
const FEW_PER_15_MINUTES = { default: { limit: 5, ttl: 15 * 60_000 } };
const FEW_PER_HOUR = { default: { limit: 5, ttl: 3_600_000 } };

/**
 * Player accounts for games.su-labs.dev: sign up with a login name, a password and a screen name (an email only to
 * reset a forgotten password), sign in on any device, and keep favourites and best results there.
 */
@Controller('v1/account')
export class AccountsController {
  private readonly secureCookie: boolean;

  constructor(
    private readonly accounts: AccountsService,
    private readonly results: ResultsService,
    config: ConfigService<Env, true>,
  ) {
    this.secureCookie = config.get('COOKIE_SECURE', { infer: true });
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
    clearSessionCookie(response, this.secureCookie, PLAYER_COOKIE);
  }

  @Get()
  @UseGuards(PlayerGuard)
  me(@Req() request: PlayerRequest): Promise<Account> {
    return this.account(this.playerOf(request));
  }

  @Patch()
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async change(
    @Req() request: PlayerRequest,
    @Body({ schema: changeSchema }) input: ChangeInput,
  ): Promise<void> {
    await this.accounts.change(this.playerOf(request), input);
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
        this.playerOf(request),
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
    if (!(await this.accounts.remove(this.playerOf(request), password))) {
      throw new UnauthorizedException('wrong-password');
    }
    clearSessionCookie(response, this.secureCookie, PLAYER_COOKIE);
  }

  @Put('favorites')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  async setFavorites(
    @Req() request: PlayerRequest,
    @Body({ schema: favoritesSchema })
    { games }: z.infer<typeof favoritesSchema>,
  ): Promise<void> {
    await this.accounts.setFavorites(this.playerOf(request), games);
  }

  /** A finished game, from a signed-in player */
  @Post('results')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async record(
    @Req() request: PlayerRequest,
    @Body({ schema: resultSchema }) result: ResultInput,
  ): Promise<void> {
    await this.results.record(this.playerOf(request).id, result);
  }

  /** Best results the browser kept before signing in */
  @Put('bests')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async mergeBests(
    @Req() request: PlayerRequest,
    @Body({ schema: bestsSchema }) { bests }: z.infer<typeof bestsSchema>,
  ): Promise<void> {
    await this.results.mergeBests(this.playerOf(request).id, bests);
  }

  private playerOf({ player }: PlayerRequest): Player {
    if (!player) {
      throw new UnauthorizedException();
    }
    return player;
  }

  private async account({
    id,
    loginName,
    screenName,
    email,
    favorites,
  }: Player): Promise<Account> {
    return {
      loginName,
      screenName,
      email,
      favorites,
      results: await this.results.mine(id),
    };
  }

  private startSession(
    { player, token, expires }: PlayerSignedIn,
    response: Response,
  ): Promise<Account> {
    setSessionCookie(
      response,
      token,
      expires,
      this.secureCookie,
      PLAYER_COOKIE,
    );
    return this.account(player);
  }
}

/** The leaderboards, for signed-in players only: screen names, games finished and best results; nothing else */
@Controller('v1/leaderboard')
@UseGuards(PlayerGuard)
export class LeaderboardController {
  constructor(private readonly results: ResultsService) {}

  @Get(':game')
  async boards(
    @Req() { player }: PlayerRequest,
    @Param('game', { schema: resultGameSchema }) game: ResultGame,
  ): Promise<{ boards: Leaderboard[] }> {
    return { boards: await this.results.leaderboards(game, player?.id ?? '') };
  }
}
