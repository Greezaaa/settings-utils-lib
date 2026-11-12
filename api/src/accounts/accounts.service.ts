import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'node:crypto';
import { FindOptionsWhere, LessThan, Not, Repository } from 'typeorm';
import {
  hashPassword,
  hashToken,
  newSessionToken,
  verifyPassword,
} from '../auth/passwords.js';
import type { Env } from '../config/env.js';
import { afterFailure, isLocked, UNLOCKED } from '../security/login-lock.js';
import type { AppId } from '../shared/apps.js';
import type { Page } from '../shared/page.js';
import type { GameSlug } from '../shared/catalog.js';
import type { ChangeInput, RegisterInput } from './accounts.schema.js';
import { Mailer } from './mailer.js';
import { PlayerSession } from './player-session.entity.js';
import { Player } from './player.entity.js';

/** How long a browser stays signed in to a player's account */
export const PLAYER_SESSION_DAYS = 90;
/** How long a password-reset link works */
const RESET_MINUTES = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** Checked against when the account doesn't exist, so a wrong name takes as long as a wrong password */
const DUMMY_HASH_PROMISE = hashPassword('not a real password');

export interface PlayerSignedIn {
  readonly player: Player;
  readonly token: string;
  readonly expires: Date;
}

/** A player as moderators see them: only what the leaderboards show, never the login name or email */
export interface ModeratedPlayer {
  readonly id: string;
  readonly app: AppId;
  readonly screenName: string;
  readonly showOnLeaderboard: boolean;
  readonly removedFromBoards: boolean;
  readonly created: Date;
}

/** Why a sign-up or change was refused, as the games site shows it */
export type AccountConflict =
  'login-taken' | 'screen-name-taken' | 'email-taken';

/**
 * Player accounts, each in one app: signing up and in, sessions kept by a cookie, the screen name, an optional email to reset a
 * forgotten password, favourites, and deleting the account with everything in it. Answers never tell a wrong name
 * from a wrong password, and an account locks for a while after too many failures.
 */
@Injectable()
export class AccountsService {
  /** Each app's site, for the links in its emails */
  private readonly appUrls: Readonly<Record<AppId, string>>;

  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(PlayerSession)
    private readonly sessions: Repository<PlayerSession>,
    private readonly mailer: Mailer,
    config: ConfigService<Env, true>,
  ) {
    this.appUrls = { games: config.get('GAMES_URL', { infer: true }) };
  }

  /** Whether accounts may have an email (only when emails can be sent) */
  get canEmail(): boolean {
    return this.mailer.isAvailable;
  }

  async register(
    app: AppId,
    {
      loginName,
      password,
      screenName,
      email,
      showOnLeaderboard,
    }: RegisterInput,
    now = new Date(),
  ): Promise<PlayerSignedIn> {
    if (email && !this.canEmail) {
      throw new BadRequestException('email-unavailable');
    }
    await this.refuseTaken(app, { loginName, screenName, email });
    await this.players.insert({
      app,
      loginName,
      screenName,
      screenNameKey: screenName.toLowerCase(),
      passwordHash: await hashPassword(password),
      email: email ?? null,
      showOnLeaderboard,
    });
    return this.startSession(
      await this.players.findOneByOrFail({ app, loginName }),
      now,
    );
  }

  /** A new session when the name (or email) and password are right; null otherwise */
  async signIn(
    app: AppId,
    name: string,
    password: string,
    now = new Date(),
  ): Promise<PlayerSignedIn | null> {
    const player = await this.players.findOneBy(
      name.includes('@') ? { app, email: name } : { app, loginName: name },
    );
    if (!player) {
      await verifyPassword(password, await DUMMY_HASH_PROMISE);
      return null;
    }
    if (isLocked(player, now)) {
      return null;
    }
    if (!(await verifyPassword(password, player.passwordHash))) {
      await this.players.update({ id: player.id }, afterFailure(player, now));
      return null;
    }
    await this.players.update({ id: player.id }, UNLOCKED);
    return this.startSession(player, now);
  }

  /** The player of `app` a session cookie belongs to, while it hasn't expired */
  async playerForToken(
    app: AppId,
    token: string,
    now = new Date(),
  ): Promise<Player | null> {
    const session = await this.sessions.findOneBy({
      tokenHash: hashToken(token),
    });
    if (!session || session.expires <= now) {
      return null;
    }
    return this.players.findOneBy({ id: session.playerId, app });
  }

  async signOut(token: string): Promise<void> {
    await this.sessions.delete({ tokenHash: hashToken(token) });
  }

  /** A new screen name, or an email added, changed or removed (changing it needs the password) */
  async change(
    player: Player,
    { screenName, email, password }: ChangeInput,
  ): Promise<void> {
    if (email !== undefined) {
      if (email !== null && !this.canEmail) {
        throw new BadRequestException('email-unavailable');
      }
      if (!password || !(await verifyPassword(password, player.passwordHash))) {
        throw new BadRequestException('wrong-password');
      }
    }
    await this.refuseTaken(
      player.app,
      { screenName, email: email ?? undefined },
      player.id,
    );
    await this.players.update(
      { id: player.id },
      {
        ...(screenName
          ? { screenName, screenNameKey: screenName.toLowerCase() }
          : {}),
        ...(email !== undefined ? { email } : {}),
      },
    );
  }

  /** Shows the player on the leaderboards or hides them */
  async setShowOnLeaderboard(player: Player, show: boolean): Promise<void> {
    await this.players.update({ id: player.id }, { showOnLeaderboard: show });
  }

  /** Changes the password after checking the current one; signs out every other browser */
  async changePassword(
    player: Player,
    current: string,
    next: string,
    keepToken: string,
  ): Promise<boolean> {
    if (!(await verifyPassword(current, player.passwordHash))) {
      return false;
    }
    await this.players.update(
      { id: player.id },
      { passwordHash: await hashPassword(next) },
    );
    await this.sessions.delete({
      playerId: player.id,
      tokenHash: Not(hashToken(keepToken)),
    });
    return true;
  }

  /** Emails a reset link when an account of `app` has this email; says nothing either way */
  async forgot(app: AppId, email: string, now = new Date()): Promise<void> {
    const player = this.canEmail
      ? await this.players.findOneBy({ app, email })
      : null;
    if (!player) {
      return;
    }
    const { token: secret, hash } = newSessionToken();
    await this.players.update(
      { id: player.id },
      {
        resetHash: hash,
        resetExpires: new Date(now.getTime() + RESET_MINUTES * MINUTE_MS),
      },
    );
    await this.mailer.send(
      email,
      'su-labs games: new password',
      [
        `Hi ${player.screenName},`,
        '',
        `To choose a new password, open this link within ${RESET_MINUTES} minutes:`,
        `${this.appUrls[app]}/account/reset/${secret}`,
        '',
        "If you didn't ask for it, you can ignore this email: your password stays the same.",
      ].join('\n'),
    );
  }

  /** Sets a new password from a reset link of `app`, signs out every browser, and signs this one in; null for a bad link */
  async reset(
    app: AppId,
    secret: string,
    password: string,
    now = new Date(),
  ): Promise<PlayerSignedIn | null> {
    const player = await this.players.findOneBy({
      app,
      resetHash: hashToken(secret),
    });
    if (!player?.resetExpires || player.resetExpires <= now) {
      return null;
    }
    await this.players.update(
      { id: player.id },
      {
        passwordHash: await hashPassword(password),
        resetHash: null,
        resetExpires: null,
        ...UNLOCKED,
      },
    );
    await this.sessions.delete({ playerId: player.id });
    return this.startSession(player, now);
  }

  /** Deletes the account and everything in it (sessions and results go with it); needs the password */
  async remove(player: Player, password: string): Promise<boolean> {
    if (!(await verifyPassword(password, player.passwordHash))) {
      return false;
    }
    await this.players.delete({ id: player.id });
    return true;
  }

  async setFavorites(
    player: Player,
    games: readonly GameSlug[],
  ): Promise<void> {
    await this.players.update(
      { id: player.id },
      { favorites: [...new Set(games)] },
    );
  }

  /** Players for moderators, newest first: those on the leaderboards, and those taken off them */
  async moderationList({ offset, limit }: Page): Promise<ModeratedPlayer[]> {
    const players = await this.players.find({
      where: [{ showOnLeaderboard: true }, { removedFromBoards: true }],
      order: { created: 'DESC' },
      skip: offset,
      take: limit,
    });
    return players.map(
      ({ id, app, screenName, showOnLeaderboard, removedFromBoards, created }) => ({
        id,
        app,
        screenName,
        showOnLeaderboard,
        removedFromBoards,
        created,
      }),
    );
  }

  /** A moderator replaces a player's screen name with a plain one (`Player 4821`), free in the player's app; null if no such player */
  async renameByModerator(id: string): Promise<string | null> {
    const player = await this.players.findOneBy({ id });
    if (!player) {
      return null;
    }
    let screenName: string;
    do {
      screenName = `Player ${randomInt(1000, 10_000)}`;
    } while (
      await this.players.existsBy({
        app: player.app,
        screenNameKey: screenName.toLowerCase(),
      })
    );
    await this.players.update(
      { id },
      { screenName, screenNameKey: screenName.toLowerCase() },
    );
    return screenName;
  }

  /** A moderator takes a player off the leaderboards, or puts them back; false if no such player */
  async setRemovedFromBoards(id: string, removed: boolean): Promise<boolean> {
    const { affected } = await this.players.update(
      { id },
      { removedFromBoards: removed },
    );
    return (affected ?? 0) > 0;
  }

  /** Refuses a login name, screen name or email someone else in the app already has */
  private async refuseTaken(
    app: AppId,
    {
      loginName,
      screenName,
      email,
    }: { loginName?: string; screenName?: string; email?: string },
    exceptId?: string,
  ): Promise<void> {
    const others = (where: FindOptionsWhere<Player>) =>
      this.players.existsBy({
        ...where,
        app,
        ...(exceptId ? { id: Not(exceptId) } : {}),
      });
    const conflicts: [AccountConflict, boolean][] = [
      ['login-taken', loginName !== undefined && (await others({ loginName }))],
      [
        'screen-name-taken',
        screenName !== undefined &&
          (await others({ screenNameKey: screenName.toLowerCase() })),
      ],
      ['email-taken', email !== undefined && (await others({ email }))],
    ];
    const conflict = conflicts.find(([, isTaken]) => isTaken);
    if (conflict) {
      throw new ConflictException(conflict[0]);
    }
  }

  private async startSession(
    player: Player,
    now: Date,
  ): Promise<PlayerSignedIn> {
    await this.sessions.delete({ expires: LessThan(now) });
    const { token, hash } = newSessionToken();
    const expires = new Date(now.getTime() + PLAYER_SESSION_DAYS * DAY_MS);
    await this.sessions.insert({
      tokenHash: hash,
      playerId: player.id,
      expires,
    });
    return { player, token, expires };
  }
}
