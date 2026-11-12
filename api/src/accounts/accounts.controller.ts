import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { z } from 'zod';
import { AuthService } from '../auth/auth.service.js';
import { readCookie, sessionToken } from '../auth/session-cookie.js';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service.js';
import { AdminGuard } from '../security/admin.guard.js';
import { API_APP, playerCookie } from '../shared/apps.js';
import type { FeatureId } from '../shared/catalog.js';
import type { ResultGame } from '../shared/catalog.js';
import { resultGameSchema } from '../shared/catalog.js';
import { limitSchema, offsetSchema } from '../shared/page.js';
import { Account, accountView, FEW_PER_15_MINUTES, playerOf } from './account-view.js';
import type { ChangeInput, ResultInput } from './accounts.schema.js';
import { bestsSchema, changeSchema, favoritesSchema, leaderboardChoiceSchema, resultSchema } from './accounts.schema.js';
import { AccountsService, ModeratedPlayer, PendingName } from './accounts.service.js';
import type { PlayerRequest } from './player.guard.js';
import { PlayerGuard } from './player.guard.js';
import { screenNameSchema } from './screen-name.js';
import { Leaderboard, ResultsService } from './results.service.js';

/** A feature switched on for everyone, or a signed-in admin trying it in preview */
async function isOpenOrPreviewed(
  feature: FeatureId,
  request: Request,
  flags: FeatureFlagsService,
  auth: AuthService,
): Promise<boolean> {
  if (await flags.isOn(feature)) {
    return true;
  }
  const adminToken = sessionToken(request);
  return adminToken !== null && (await auth.adminForToken(adminToken)) !== null;
}

/**
 * A signed-in player's account on games.su-labs.dev: their details, favourites and best results. Signing up, in and
 * out, passwords and deleting the account are on auth.su-labs.dev (PlayerSignInController).
 */
@Controller('v1/account')
export class AccountsController {
  constructor(
    private readonly accounts: AccountsService,
    private readonly results: ResultsService,
    private readonly flags: FeatureFlagsService,
    private readonly auth: AuthService,
  ) {}

  @Get()
  @UseGuards(PlayerGuard)
  me(@Req() request: PlayerRequest): Promise<Account> {
    return accountView(playerOf(request), this.results);
  }

  @Patch()
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async change(
    @Req() request: PlayerRequest,
    @Body({ schema: changeSchema }) input: ChangeInput,
  ): Promise<void> {
    await this.accounts.change(playerOf(request), input);
  }

  /**
   * Shows the player on the leaderboards or hides them. A switch a player may flip back and forth, so it allows more
   * than the name and email changes (which can check a password, and stay strict)
   */
  @Put('leaderboard')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async setShowOnLeaderboard(
    @Req() request: PlayerRequest,
    @Body({ schema: leaderboardChoiceSchema })
    { show }: z.infer<typeof leaderboardChoiceSchema>,
  ): Promise<void> {
    await this.accounts.setShowOnLeaderboard(playerOf(request), show);
  }

  /**
   * A short-lived pass for the rooms service to show the player's screen name, while `room-names` is on: null until a
   * moderator approves the name (or when it can't show in rooms)
   */
  @Get('room-name')
  @UseGuards(PlayerGuard)
  async roomName(
    @Req() request: PlayerRequest,
  ): Promise<{ pass: string | null }> {
    const isOpen = await isOpenOrPreviewed(
      'room-names',
      request,
      this.flags,
      this.auth,
    );
    return {
      pass: isOpen ? this.accounts.roomNamePass(playerOf(request)) : null,
    };
  }

  @Put('favorites')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  async setFavorites(
    @Req() request: PlayerRequest,
    @Body({ schema: favoritesSchema })
    { games }: z.infer<typeof favoritesSchema>,
  ): Promise<void> {
    await this.accounts.setFavorites(playerOf(request), games);
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
    await this.results.record(playerOf(request).id, result);
  }

  /** Best results the browser kept before signing in */
  /** The player deletes their results (plays, bests, leaderboard places) and keeps the account */
  @Delete('results')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async clearResults(@Req() request: PlayerRequest): Promise<void> {
    await this.results.clear(playerOf(request).id);
  }

  @Put('bests')
  @HttpCode(204)
  @UseGuards(PlayerGuard)
  @Throttle(FEW_PER_15_MINUTES)
  async mergeBests(
    @Req() request: PlayerRequest,
    @Body({ schema: bestsSchema }) { bests }: z.infer<typeof bestsSchema>,
  ): Promise<void> {
    await this.results.mergeBests(playerOf(request).id, bests);
  }
}

/**
 * The leaderboards: screen names of the players who chose to show, games finished and best results; nothing else.
 * Signed-in players only, until the admin opens `public-leaderboard` (or previews it): then anyone may look, and players
 * who chose not to show are ranked too, under no name.
 */
@Controller('v1/leaderboard')
export class LeaderboardController {
  constructor(
    private readonly results: ResultsService,
    private readonly accounts: AccountsService,
    private readonly flags: FeatureFlagsService,
    private readonly auth: AuthService,
  ) {}

  @Get(':game')
  async boards(
    @Req() request: Request,
    @Param('game', { schema: resultGameSchema }) game: ResultGame,
  ): Promise<{ boards: Leaderboard[] }> {
    const token = readCookie(request, playerCookie(API_APP));
    const player = token
      ? await this.accounts.playerForToken(API_APP, token)
      : null;
    const isPublic = await this.isPublic(request);
    if (!player && !isPublic) {
      throw new UnauthorizedException();
    }
    return {
      boards: await this.results.leaderboards(
        game,
        player?.id ?? null,
        isPublic,
      ),
    };
  }

  /** Open to everyone: switched on, or the admin trying it in preview */
  private isPublic(request: Request): Promise<boolean> {
    return isOpenOrPreviewed(
      'public-leaderboard',
      request,
      this.flags,
      this.auth,
    );
  }
}

const nameReportSchema = z.object({ screenName: screenNameSchema });

/** Players report a screen name they found rude in a room; it stops showing in rooms until a moderator looks again */
@Controller('v1/name-reports')
export class NameReportsController {
  constructor(private readonly accounts: AccountsService) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 3_600_000 } })
  async report(
    @Body({ schema: nameReportSchema })
    { screenName }: z.infer<typeof nameReportSchema>,
  ): Promise<void> {
    await this.accounts.reportName(API_APP, screenName);
  }
}

const playerIdSchema = z.uuid();
const removedSchema = z.object({ removedFromBoards: z.boolean() });

/**
 * For moderators: the players on the leaderboards, to give one a plain new name (a rude screen name) or take them off
 * the leaderboards (made-up scores), and put them back
 */
@Controller('admin/players')
@UseGuards(AdminGuard)
export class PlayersAdminController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  list(
    @Query('offset', { schema: offsetSchema }) offset: number,
    @Query('limit', { schema: limitSchema }) limit: number,
  ): Promise<ModeratedPlayer[]> {
    return this.accounts.moderationList({ offset, limit });
  }

  /** Screen names waiting to be allowed in rooms, reported ones first */
  @Get('names')
  pendingNames(
    @Query('offset', { schema: offsetSchema }) offset: number,
    @Query('limit', { schema: limitSchema }) limit: number,
  ): Promise<PendingName[]> {
    return this.accounts.pendingNames({ offset, limit });
  }

  /** Lets a screen name show in rooms; a rude one gets a plain new name instead (rename) */
  @Post(':id/approve-name')
  @HttpCode(204)
  async approveName(
    @Param('id', { schema: playerIdSchema }) id: string,
  ): Promise<void> {
    if (!(await this.accounts.approveName(id))) {
      throw new NotFoundException();
    }
  }

  @Post(':id/rename')
  async rename(
    @Param('id', { schema: playerIdSchema }) id: string,
  ): Promise<{ screenName: string }> {
    const screenName = await this.accounts.renameByModerator(id);
    if (screenName === null) {
      throw new NotFoundException();
    }
    return { screenName };
  }

  @Patch(':id')
  @HttpCode(204)
  async setRemoved(
    @Param('id', { schema: playerIdSchema }) id: string,
    @Body({ schema: removedSchema })
    { removedFromBoards }: z.infer<typeof removedSchema>,
  ): Promise<void> {
    if (!(await this.accounts.setRemovedFromBoards(id, removedFromBoards))) {
      throw new NotFoundException();
    }
  }
}
