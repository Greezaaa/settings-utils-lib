import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { credentialedFetch, field, jsonInit, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
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
}

/** One line of a leaderboard: only the screen name is shown, never anything else about the player */
export interface LeaderboardEntry {
  readonly place: number;
  readonly screenName: string;
  readonly plays: number;
  readonly best: number;
  readonly isMe: boolean;
}

export interface Leaderboard {
  readonly key: string;
  readonly entries: readonly LeaderboardEntry[];
}

/** Why the API refused an account request; each has its message on the account page */
export const ACCOUNT_PROBLEMS = [
  'invalid',
  'wrong-login',
  'wrong-password',
  'login-taken',
  'screen-name-taken',
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
  return isNumber(place) && typeof screenName === 'string' && isNumber(plays) && isNumber(best) && typeof isMe === 'boolean'
    ? [{ place, screenName, plays, best, isMe }]
    : [];
}

function parseBoard(item: unknown): Leaderboard[] {
  const key = field(item, 'key');
  const entries = field(item, 'entries');
  return typeof key === 'string' && Array.isArray(entries)
    ? [{ key, entries: entries.flatMap((entry: unknown) => parseEntry(entry)) }]
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
    return field(await this.read('/v1/account/options'), 'email') === true;
  }

  register(details: {
    loginName: string;
    password: string;
    screenName: string;
    email?: string;
    showOnLeaderboard: boolean;
  }): Promise<AccountAnswer> {
    return this.startSession(this.fetch('/v1/account', jsonInit('POST', details), SEND_TIMEOUT_MS));
  }

  /** Signs in with the login name or the account's email */
  signIn(loginName: string, password: string): Promise<AccountAnswer> {
    return this.startSession(this.fetch('/v1/account/login', jsonInit('POST', { loginName, password }), SEND_TIMEOUT_MS));
  }

  /** Sets a new password from a reset link, and signs in */
  reset(secret: string, password: string): Promise<AccountAnswer> {
    const path = `/v1/account/reset/${encodeURIComponent(secret)}`;
    return this.startSession(this.fetch(path, jsonInit('POST', { password }), SEND_TIMEOUT_MS));
  }

  async signOut(): Promise<void> {
    await this.fetch('/v1/account/logout', { method: 'POST' }, READ_TIMEOUT_MS);
    this.signedIn.set(null);
  }

  /** A new screen name, an email added, changed or removed (with the password), or showing on the leaderboards or not */
  async change(changes: {
    screenName?: string;
    email?: string | null;
    password?: string;
    showOnLeaderboard?: boolean;
  }): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account', jsonInit('PATCH', changes), SEND_TIMEOUT_MS));
    if (answer === 'done') {
      await this.restore();
    }
    return answer;
  }

  changePassword(current: string, next: string): Promise<AccountAnswer> {
    return this.answer(this.fetch('/v1/account/password', jsonInit('POST', { current, next }), SEND_TIMEOUT_MS));
  }

  /** Asks for a reset link by email; the API answers the same whether or not an account has it */
  forgot(email: string): Promise<AccountAnswer> {
    return this.answer(this.fetch('/v1/account/forgot', jsonInit('POST', { email }), SEND_TIMEOUT_MS));
  }

  /** Deletes the account and everything in it */
  async remove(password: string): Promise<AccountAnswer> {
    const answer = await this.answer(this.fetch('/v1/account', jsonInit('DELETE', { password }), SEND_TIMEOUT_MS));
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

  /** A game's leaderboards, for signed-in players */
  async leaderboards(game: ResultGame): Promise<Leaderboard[] | null> {
    const boards = field(await this.read(`/v1/leaderboard/${game}`), 'boards');
    return Array.isArray(boards) ? boards.flatMap((board: unknown) => parseBoard(board)) : null;
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

  private async read(path: string): Promise<unknown> {
    const response = await this.fetch(path, {}, READ_TIMEOUT_MS);
    return response?.ok ? response.json() : null;
  }

  private fetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response | null> {
    return credentialedFetch(this.document, path, init, timeoutMs);
  }
}
