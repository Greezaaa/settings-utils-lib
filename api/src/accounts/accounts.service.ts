import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'node:crypto';
import { FindOptionsWhere, LessThan, Not, Repository } from 'typeorm';
import { hashPassword, hashToken, newSessionToken, verifyPassword } from '../auth/passwords.js';
import type { Env } from '../config/env.js';
import { afterFailure, isLocked, UNLOCKED } from '../security/login-lock.js';
import type { AppId } from '../shared/apps.js';
import type { Page } from '../shared/page.js';
import type { GameSlug } from '../shared/catalog.js';
import { signNamePass } from '../shared/name-pass.js';
import { WordReport } from '../word-reports/word-report.entity.js';
import type { ChangeInput, RegisterInput } from './accounts.schema.js';
import { Mailer } from './mailer.js';
import { PlayerSession } from './player-session.entity.js';
import { Player } from './player.entity.js';
import { isRudeName, SCREEN_NAME_PATTERN } from './screen-name.js';

export const PLAYER_SESSION_DAYS = 90;
const RESET_MINUTES = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const DUMMY_HASH_PROMISE = hashPassword('not a real password');

export interface PlayerSignedIn {
  readonly player: Player;
  readonly token: string;
  readonly expires: Date;
}

export interface ModeratedPlayer {
  readonly id: string;
  readonly app: AppId;
  readonly screenName: string;
  readonly showOnLeaderboard: boolean;
  readonly removedFromBoards: boolean;
  readonly created: Date;
}

export interface PendingName {
  readonly id: string;
  readonly app: AppId;
  readonly screenName: string;
  readonly reports: number;
  readonly created: Date;
}

const NEW_NAME = { nameApproved: false, nameReports: 0 } as const;

export type AccountConflict =
  | 'login-taken'
  | 'screen-name-taken'
  | 'email-taken';

@Injectable()
export class AccountsService {
  private readonly appUrls: Readonly<Record<AppId, string>>;
  private readonly roomNameSecret: string | undefined;

  constructor(
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(PlayerSession)
    private readonly sessions: Repository<PlayerSession>,
    @InjectRepository(WordReport)
    private readonly wordReports: Repository<WordReport>,
    private readonly mailer: Mailer,
    config: ConfigService<Env, true>,
  ) {
    this.appUrls = { games: config.get('GAMES_URL', { infer: true }) };
    this.roomNameSecret = config.get('ROOM_NAME_SECRET', { infer: true });
  }

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
    await this.refuseRudeName(screenName);
    await this.refuseTaken(app, { loginName, screenName, email });
    await this.players.insert({
      app,
      loginName,
      screenName,
      screenNameKey: screenName.toLowerCase(),
      passwordHash: await hashPassword(password),
      email: email ?? null,
      showOnLeaderboard,
      ...NEW_NAME,
    });
    return this.startSession(
      await this.players.findOneByOrFail({ app, loginName }),
      now,
    );
  }

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
    if (screenName) {
      await this.refuseRudeName(screenName);
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
          ? { screenName, screenNameKey: screenName.toLowerCase(), ...NEW_NAME }
          : {}),
        ...(email !== undefined ? { email } : {}),
      },
    );
  }

  async setShowOnLeaderboard(player: Player, show: boolean): Promise<void> {
    await this.players.update({ id: player.id }, { showOnLeaderboard: show });
  }

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

  async moderationList({ offset, limit }: Page): Promise<ModeratedPlayer[]> {
    const players = await this.players.find({
      where: [{ showOnLeaderboard: true }, { removedFromBoards: true }],
      order: { created: 'DESC' },
      skip: offset,
      take: limit,
    });
    return players.map(
      ({
        id,
        app,
        screenName,
        showOnLeaderboard,
        removedFromBoards,
        created,
      }) => ({
        id,
        app,
        screenName,
        showOnLeaderboard,
        removedFromBoards,
        created,
      }),
    );
  }

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
      {
        screenName,
        screenNameKey: screenName.toLowerCase(),
        nameApproved: true,
      },
    );
    return screenName;
  }

  async pendingNames({ offset, limit }: Page): Promise<PendingName[]> {
    const players = await this.players.find({
      where: { nameApproved: false },
      order: { nameReports: 'DESC', created: 'ASC' },
      skip: offset,
      take: limit,
    });
    return players.map(({ id, app, screenName, nameReports, created }) => ({
      id,
      app,
      screenName,
      reports: nameReports,
      created,
    }));
  }

  async approveName(id: string): Promise<boolean> {
    const { affected } = await this.players.update(
      { id },
      { nameApproved: true, nameReports: 0 },
    );
    return (affected ?? 0) > 0;
  }

  roomNamePass({
    screenName,
    nameApproved,
    removedFromBoards,
  }: Player): string | null {
    const allowed =
      nameApproved &&
      !removedFromBoards &&
      SCREEN_NAME_PATTERN.test(screenName);
    return allowed && this.roomNameSecret
      ? signNamePass(screenName, this.roomNameSecret)
      : null;
  }

  async reportName(app: AppId, screenName: string): Promise<void> {
    await this.players
      .createQueryBuilder()
      .update()
      .set({ nameApproved: false, nameReports: () => 'name_reports + 1' })
      .where('app = :app AND screen_name_key = :key', {
        app,
        key: screenName.toLowerCase(),
      })
      .execute();
  }

  private async refuseRudeName(screenName: string): Promise<void> {
    const rows = await this.wordReports.find({
      select: { word: true },
      where: { status: 'approved' },
    });
    if (
      isRudeName(
        screenName,
        rows.map(({ word }) => word),
      )
    ) {
      throw new BadRequestException('rude-name');
    }
  }

  async setRemovedFromBoards(id: string, removed: boolean): Promise<boolean> {
    const { affected } = await this.players.update(
      { id },
      { removedFromBoards: removed },
    );
    return (affected ?? 0) > 0;
  }

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
