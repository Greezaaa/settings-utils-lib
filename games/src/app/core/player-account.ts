import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ApiService, credentialedFetch, field, jsonInit, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { Connection } from './connection';
import { FavoriteGames, readFavorites } from './favorite-games';
import { FeatureFlags } from './feature-flags';
import { GameSlug } from './games';
import { isGameSlug } from './games-api';
import { BestResult, bestsToSend, isResultGame, mergedBests, RESULT_GAME_SLUGS, RESULT_GAMES, ResultGame, storedBests } from './player-results';
import { rememberSignedIn, wasSignedIn } from './session-hint';
import { readStored, writeStored } from './site-storage';

export interface AccountResult extends BestResult {
  readonly plays: number;
}

export interface Account {
  readonly loginName: string;
  readonly screenName: string;
  readonly email: string | null;
  readonly showOnLeaderboard: boolean;
  readonly nameApproved: boolean;
}

const SIGN_IN_PATH = '/v1/apps/games/account';

/** Players shown per leaderboard; keep in sync with LEADERBOARD_SIZE in api/src/accounts/results.service.ts */
export const LEADERBOARD_SIZE = 10;

export interface LeaderboardEntry {
  readonly place: number;
  readonly screenName: string | null;
  readonly plays: number;
  readonly best: number;
  readonly isMe: boolean;
}

export interface Leaderboard {
  readonly key: string;
  readonly players: number;
  readonly plays: number;
  readonly entries: readonly LeaderboardEntry[];
  readonly me: LeaderboardEntry | null;
}

export const ACCOUNT_PROBLEMS = [
  'invalid',
  'wrong-login',
  'wrong-password',
  'login-taken',
  'screen-name-taken',
  'rude-name',
  'email-taken',
  'email-unavailable',
  'not-found',
  'too-many',
  'offline',
] as const;
export type AccountProblem = (typeof ACCOUNT_PROBLEMS)[number];
const isAccountProblem = (value: unknown): value is AccountProblem => ACCOUNT_PROBLEMS.some((problem) => problem === value);

export type AccountAnswer = 'done' | AccountProblem;

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function parseResult(item: unknown): AccountResult[] {
  const [game, key, plays, best] = ['game', 'key', 'plays', 'best'].map((name) => field(item, name));
  return typeof game === 'string' && isResultGame(game) && typeof key === 'string' && isNumber(plays) && isNumber(best)
    ? [{ game, key, plays, value: best }]
    : [];
}

function parseEntry(item: unknown): LeaderboardEntry[] {
  const [place, screenName, plays, best, isMe] = ['place', 'screenName', 'plays', 'best', 'isMe'].map((name) =>
    field(item, name),
  );
  return isNumber(place) &&
    (typeof screenName === 'string' || screenName === null) &&
    isNumber(plays) &&
    isNumber(best) &&
    typeof isMe === 'boolean'
    ? [{ place, screenName, plays, best, isMe }]
    : [];
}

function parseBoard(item: unknown): Leaderboard[] {
  const [key, players, plays, entries] = ['key', 'players', 'plays', 'entries'].map((name) => field(item, name));
  const [me] = parseEntry(field(item, 'me'));
  return typeof key === 'string' && isNumber(players) && isNumber(plays) && Array.isArray(entries)
    ? [{ key, players, plays, entries: entries.flatMap((entry: unknown) => parseEntry(entry)), me: me ?? null }]
    : [];
}

@Injectable({ providedIn: 'root' })
export class PlayerAccount {
  private readonly document = inject(DOCUMENT);
  private readonly features = inject(FeatureFlags);
  private readonly favorites = inject(FavoriteGames);
  private readonly connection = inject(Connection);
  private readonly signedIn = signal<Account | null>(null);
  private readonly isKnown = signal(false);
  private savedFavorites: readonly GameSlug[] = [];

  readonly account = this.signedIn.asReadonly();
  readonly isSignedIn = computed(() => this.signedIn() !== null);
  readonly isAvailable = computed(() => this.features.canUse('accounts'));
  readonly isRestored = this.isKnown.asReadonly();

  constructor() {
    afterNextRender(async () => {
      if (!wasSignedIn('player')) {
        this.isKnown.set(true);
      }
      await this.features.ready();
      if (this.isAvailable()) {
        await this.restore();
      }
      this.isKnown.set(true);
    });
    let wasOnline = true;
    effect(() => {
      const isOnline = this.connection.isOnline();
      if (isOnline && !wasOnline && untracked(this.isAvailable) && wasSignedIn('player')) {
        void untracked(() => this.restore());
      }
      wasOnline = isOnline;
    });
    effect(() => {
      const games = this.favorites.games();
      if (untracked(this.isSignedIn) && games.join() !== this.savedFavorites.join()) {
        this.savedFavorites = games;
        void this.fetch('/v1/account/favorites', jsonInit('PUT', { games }), SEND_TIMEOUT_MS);
      }
    });
  }

  async canEmail(): Promise<boolean> {
    return field(await this.read(`${SIGN_IN_PATH}/options`, 'auth'), 'email') === true;
  }

  register(details: {
    loginName: string;
    password: string;
    screenName: string;
    email?: string;
    showOnLeaderboard: boolean;
  }): Promise<AccountAnswer> {
    return this.startSession(this.fetch(SIGN_IN_PATH, jsonInit('POST', details), SEND_TIMEOUT_MS, 'auth'));
  }

  signIn(loginName: string, password: string): Promise<AccountAnswer> {
    return this.startSession(this.fetch(`${SIGN_IN_PATH}/login`, jsonInit('POST', { loginName, password }), SEND_TIMEOUT_MS, 'auth'));
  }

  reset(secret: string, password: string): Promise<AccountAnswer> {
    const path = `${SIGN_IN_PATH}/reset/${encodeURIComponent(secret)}`;
    return this.startSession(this.fetch(path, jsonInit('POST', { password }), SEND_TIMEOUT_MS, 'auth'));
  }

  async signOut(): Promise<void> {
    await this.fetch(`${SIGN_IN_PATH}/logout`, { method: 'POST' }, READ_TIMEOUT_MS, 'auth');
    this.setAccount(null);
  }

  async change(changes: { screenName?: string; email?: string | null; password?: string }): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account', jsonInit('PATCH', changes), SEND_TIMEOUT_MS));
    if (answer === 'done') {
      await this.restore();
    }
    return answer;
  }

  async setShowOnLeaderboard(show: boolean): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account/leaderboard', jsonInit('PUT', { show }), SEND_TIMEOUT_MS));
    if (answer === 'done') {
      this.patch({ showOnLeaderboard: show });
    }
    return answer;
  }

  changePassword(current: string, next: string): Promise<AccountAnswer> {
    return this.answer(this.fetch(`${SIGN_IN_PATH}/password`, jsonInit('POST', { current, next }), SEND_TIMEOUT_MS, 'auth'));
  }

  forgot(email: string): Promise<AccountAnswer> {
    return this.answer(this.fetch(`${SIGN_IN_PATH}/forgot`, jsonInit('POST', { email }), SEND_TIMEOUT_MS, 'auth'));
  }

  async remove(password: string): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch(SIGN_IN_PATH, jsonInit('DELETE', { password }), SEND_TIMEOUT_MS, 'auth'));
    if (answer === 'done') {
      this.setAccount(null);
    }
    return answer;
  }

  async removeResults(): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account/results', { method: 'DELETE' }, SEND_TIMEOUT_MS));
    if (answer === 'done') {
      for (const game of RESULT_GAME_SLUGS) {
        writeStored(RESULT_GAMES[game].storage, {});
      }
    }
    return answer;
  }

  record(game: ResultGame, key: string, value: number): void {
    if (this.isSignedIn()) {
      void this.fetch('/v1/account/results', jsonInit('POST', { game, key, value }), SEND_TIMEOUT_MS);
    }
  }

  async leaderboards(game: ResultGame): Promise<Leaderboard[] | null> {
    const boards = field(await this.read(`/v1/leaderboard/${game}`), 'boards');
    return Array.isArray(boards) ? boards.flatMap((board: unknown) => parseBoard(board)) : null;
  }

  async roomNamePass(): Promise<string | null> {
    if (!this.isSignedIn() || !this.features.canUse('room-names')) {
      return null;
    }
    const pass = field(await this.read('/v1/account/room-name'), 'pass');
    return typeof pass === 'string' ? pass : null;
  }

  private patch(changes: Partial<Account>): void {
    this.signedIn.update((account) => (account ? { ...account, ...changes } : account));
  }

  private async restore(): Promise<void> {
    const response = await this.fetch('/v1/account', {}, READ_TIMEOUT_MS);
    if (response?.ok) {
      await this.adopt(await response.json());
    } else if (response) {
      this.setAccount(null);
    }
  }

  private async startSession(request: Promise<Response | null>): Promise<AccountAnswer> {
    const response = await request;
    if (!response) {
      return 'offline';
    }
    if (!response.ok) {
      return this.reason(response);
    }
    await this.adopt(await response.json());
    return 'done';
  }

  private setAccount(account: Account | null): void {
    this.signedIn.set(account);
    rememberSignedIn('player', account !== null);
  }

  private async adopt(body: unknown): Promise<void> {
    const [loginName, screenName, email, results] = ['loginName', 'screenName', 'email', 'results'].map((name) =>
      field(body, name),
    );
    if (typeof loginName !== 'string' || typeof screenName !== 'string') {
      this.setAccount(null);
      return;
    }
    const accountResults = Array.isArray(results) ? results.flatMap((item: unknown) => parseResult(item)) : [];
    const accountFavorites = readFavorites(field(body, 'favorites'));
    this.savedFavorites = accountFavorites;
    this.setAccount({
      loginName,
      screenName,
      email: typeof email === 'string' ? email : null,
      showOnLeaderboard: field(body, 'showOnLeaderboard') === true,
      nameApproved: field(body, 'nameApproved') === true,
    });
    this.favorites.set([...new Set([...this.favorites.games(), ...accountFavorites])].filter((game) => isGameSlug(game)));
    const local = RESULT_GAME_SLUGS.flatMap((game) => storedBests(game, readStored(RESULT_GAMES[game].storage)));
    const bests = bestsToSend(local, accountResults);
    if (bests.length > 0) {
      await this.fetch('/v1/account/bests', jsonInit('PUT', { bests }), SEND_TIMEOUT_MS);
    }
    for (const game of RESULT_GAME_SLUGS) {
      const { storage } = RESULT_GAMES[game];
      writeStored(storage, mergedBests(game, readStored(storage), accountResults));
    }
  }

  private async answer(request: Promise<Response | null>): Promise<AccountAnswer> {
    const response = await request;
    return !response ? 'offline' : response.ok ? 'done' : this.reason(response);
  }

  private async reason(response: Response): Promise<AccountProblem> {
    if (response.status === 404) {
      return 'not-found';
    }
    if (response.status === 429) {
      return 'too-many';
    }
    const message: unknown = field(await response.json().catch(() => null), 'message');
    return isAccountProblem(message) ? message : 'invalid';
  }

  private async read(path: string, service: ApiService = 'api'): Promise<unknown> {
    const response = await this.fetch(path, {}, READ_TIMEOUT_MS, service);
    return response?.ok ? response.json() : null;
  }

  private fetch(path: string, init: RequestInit, timeoutMs: number, service: ApiService = 'api'): Promise<Response | null> {
    return credentialedFetch(this.document, path, init, timeoutMs, service);
  }
}
