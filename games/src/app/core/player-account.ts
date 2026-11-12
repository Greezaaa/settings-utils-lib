import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ApiService, credentialedFetch, field, jsonInit, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { FavoriteGames, readFavorites } from './favorite-games';
import { FeatureFlags } from './feature-flags';
import { GameSlug } from './games';
import { isGameSlug } from './games-api';
import { BestResult, bestsToSend, isResultGame, mergedBests, RESULT_GAME_SLUGS, RESULT_GAMES, ResultGame, storedBests } from './player-results';
import { readStored, writeStored } from './site-storage';

/** A player's results in one game and settings, as their account keeps them */
export interface AccountResult extends BestResult {
  readonly plays: number;
}

export interface Account {
  readonly loginName: string;
  readonly screenName: string;
  readonly email: string | null;
  /** Whether the player appears on the leaderboards (they choose; off by default) */
  readonly showOnLeaderboard: boolean;
  /** Whether a moderator approved the screen name, so it can show in rooms */
  readonly nameApproved: boolean;
}

/**
 * Where players of this site sign in on the auth service: the games' own accounts (api/src/shared/apps.ts), apart
 * from other su-labs apps
 */
const SIGN_IN_PATH = '/v1/apps/games/account';

/** Players shown per leaderboard; keep in sync with LEADERBOARD_SIZE in api/src/accounts/results.service.ts */
export const LEADERBOARD_SIZE = 10;

/** One line of a leaderboard: only the screen name is shown, never anything else about the player */
export interface LeaderboardEntry {
  readonly place: number;
  /** null for a player who chose not to appear, ranked under a mystery name */
  readonly screenName: string | null;
  readonly plays: number;
  readonly best: number;
  readonly isMe: boolean;
}

export interface Leaderboard {
  readonly key: string;
  /** Everyone ranked on the board, and the games they finished */
  readonly players: number;
  readonly plays: number;
  readonly entries: readonly LeaderboardEntry[];
  /** The signed-in player, when they're ranked below the best players */
  readonly me: LeaderboardEntry | null;
}

/** Why the API refused an account request; each has its message on the account page */
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

/** How an account request went: done, or what went wrong (`offline` when the API is out of reach) */
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

/**
 * The player's optional account (behind the `accounts` switch): signing up and in on any device, the screen name,
 * favourites and best results kept in step between this browser and the account, and the leaderboards. The session
 * lives in an HttpOnly cookie for api.su-labs.dev, so no script here can read it.
 */
@Injectable({ providedIn: 'root' })
export class PlayerAccount {
  private readonly document = inject(DOCUMENT);
  private readonly features = inject(FeatureFlags);
  private readonly favorites = inject(FavoriteGames);
  private readonly signedIn = signal<Account | null>(null);
  /** Whether the API has said if this browser is signed in */
  private readonly isKnown = signal(false);
  /** The favourites the account has, to send only changes */
  private savedFavorites: readonly GameSlug[] = [];

  readonly account = this.signedIn.asReadonly();
  readonly isSignedIn = computed(() => this.signedIn() !== null);
  readonly isAvailable = computed(() => this.features.canUse('accounts'));
  readonly isRestored = this.isKnown.asReadonly();

  constructor() {
    afterNextRender(async () => {
      await this.features.ready();
      if (this.isAvailable()) {
        await this.restore();
      }
      this.isKnown.set(true);
    });
    // Favourites changed here go to the account too
    effect(() => {
      const games = this.favorites.games();
      if (untracked(this.isSignedIn) && games.join() !== this.savedFavorites.join()) {
        this.savedFavorites = games;
        void this.fetch('/v1/account/favorites', jsonInit('PUT', { games }), SEND_TIMEOUT_MS);
      }
    });
  }

  /** Whether the API offers email for password resets */
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

  /** Signs in with the login name or the account's email */
  signIn(loginName: string, password: string): Promise<AccountAnswer> {
    return this.startSession(this.fetch(`${SIGN_IN_PATH}/login`, jsonInit('POST', { loginName, password }), SEND_TIMEOUT_MS, 'auth'));
  }

  /** Sets a new password from a reset link, and signs in */
  reset(secret: string, password: string): Promise<AccountAnswer> {
    const path = `${SIGN_IN_PATH}/reset/${encodeURIComponent(secret)}`;
    return this.startSession(this.fetch(path, jsonInit('POST', { password }), SEND_TIMEOUT_MS, 'auth'));
  }

  async signOut(): Promise<void> {
    await this.fetch(`${SIGN_IN_PATH}/logout`, { method: 'POST' }, READ_TIMEOUT_MS, 'auth');
    this.signedIn.set(null);
  }

  /** A new screen name, or an email added, changed or removed (with the password); both come back as the API tidied them */
  async change(changes: { screenName?: string; email?: string | null; password?: string }): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account', jsonInit('PATCH', changes), SEND_TIMEOUT_MS));
    if (answer === 'done') {
      await this.restore();
    }
    return answer;
  }

  /** Shows the player on the leaderboards or hides them; a switch, so only that value changes here */
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

  /** Asks for a reset link by email; the API answers the same whether or not an account has it */
  forgot(email: string): Promise<AccountAnswer> {
    return this.answer(this.fetch(`${SIGN_IN_PATH}/forgot`, jsonInit('POST', { email }), SEND_TIMEOUT_MS, 'auth'));
  }

  /** Deletes the account and everything in it */
  async remove(password: string): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch(SIGN_IN_PATH, jsonInit('DELETE', { password }), SEND_TIMEOUT_MS, 'auth'));
    if (answer === 'done') {
      this.signedIn.set(null);
    }
    return answer;
  }

  /**
   * Deletes the player's results in the account (plays, bests, leaderboard places) and the bests kept in this browser,
   * so they aren't sent back on the next sign-in; the account stays
   */
  async removeResults(): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account/results', { method: 'DELETE' }, SEND_TIMEOUT_MS));
    if (answer === 'done') {
      for (const game of RESULT_GAME_SLUGS) {
        writeStored(RESULT_GAMES[game].storage, {});
      }
    }
    return answer;
  }

  /** A finished game, sent to the account when signed in (the page keeps its own best in this browser either way) */
  record(game: ResultGame, key: string, value: number): void {
    if (this.isSignedIn()) {
      void this.fetch('/v1/account/results', jsonInit('POST', { game, key, value }), SEND_TIMEOUT_MS);
    }
  }

  /** A game's leaderboards: for signed-in players, or for anyone once they're public */
  async leaderboards(game: ResultGame): Promise<Leaderboard[] | null> {
    const boards = field(await this.read(`/v1/leaderboard/${game}`), 'boards');
    return Array.isArray(boards) ? boards.flatMap((board: unknown) => parseBoard(board)) : null;
  }

  /**
   * A pass for the rooms service to show the player's approved screen name, while `room-names` is open; null when
   * signed out, not approved yet, or the API can't be reached (the room then shows the nickname)
   */
  async roomNamePass(): Promise<string | null> {
    if (!this.isSignedIn() || !this.features.canUse('room-names')) {
      return null;
    }
    const pass = field(await this.read('/v1/account/room-name'), 'pass');
    return typeof pass === 'string' ? pass : null;
  }

  /** Changes the signed-in account here without asking the API again */
  private patch(changes: Partial<Account>): void {
    this.signedIn.update((account) => (account ? { ...account, ...changes } : account));
  }

  private async restore(): Promise<void> {
    const response = await this.fetch('/v1/account', {}, READ_TIMEOUT_MS);
    if (response?.ok) {
      await this.adopt(await response.json());
    } else if (response) {
      this.signedIn.set(null);
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

  /** Takes the account the API sent, and brings this browser and the account into step */
  private async adopt(body: unknown): Promise<void> {
    const [loginName, screenName, email, results] = ['loginName', 'screenName', 'email', 'results'].map((name) =>
      field(body, name),
    );
    if (typeof loginName !== 'string' || typeof screenName !== 'string') {
      this.signedIn.set(null);
      return;
    }
    const accountResults = Array.isArray(results) ? results.flatMap((item: unknown) => parseResult(item)) : [];
    const accountFavorites = readFavorites(field(body, 'favorites'));
    // Favourites from both, this browser's first
    this.savedFavorites = accountFavorites;
    this.signedIn.set({
      loginName,
      screenName,
      email: typeof email === 'string' ? email : null,
      showOnLeaderboard: field(body, 'showOnLeaderboard') === true,
      nameApproved: field(body, 'nameApproved') === true,
    });
    this.favorites.set([...new Set([...this.favorites.games(), ...accountFavorites])].filter((game) => isGameSlug(game)));
    // Best results: this browser's go to the account, the account's come into this browser
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

  /** The reason in an error answer (e.g. `login-taken`), `not-found` for a bad link, `too-many` tries, or `invalid` */
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

  /** A request with the player's cookie, to the API or the auth service (signing in, out and passwords) */
  private fetch(path: string, init: RequestInit, timeoutMs: number, service: ApiService = 'api'): Promise<Response | null> {
    return credentialedFetch(this.document, path, init, timeoutMs, service);
  }
}
