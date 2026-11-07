import { DOCUMENT, inject, Injectable } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { GAME_SLUGS, GameSlug } from './games';

/** The API of the games site (api/ in this repository) */
export const API_URL = 'https://api.su-labs.dev';
/** The API run locally (`npm run start:dev` in api/), used while the site itself runs on localhost */
const LOCAL_API_URL = 'http://localhost:3000';

/** Preset feedback reasons, as the API accepts them; no free text, so nothing personal can be sent */
export const FEEDBACK_REASONS = {
  up: ['fun', 'learned'],
  down: ['too-easy', 'too-hard', 'boring', 'confusing', 'bug'],
} as const;
export type Vote = keyof typeof FEEDBACK_REASONS;
export type FeedbackReason = (typeof FEEDBACK_REASONS)[Vote][number];

export const SUGGESTION_CATEGORIES = ['new-game', 'improvement', 'drawing', 'problem', 'other'] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

/** How long to wait for the API before going on without it (it can be slow or blocked) */
const READ_TIMEOUT_MS = 4000;
const SEND_TIMEOUT_MS = 15000;

/** A game the admin switched on or off */
export interface GameSwitch {
  readonly game: GameSlug;
  readonly enabled: boolean;
}

export interface GamePlays {
  readonly game: GameSlug;
  readonly plays: number;
}

const isGameSlug = (value: unknown): value is GameSlug => GAME_SLUGS.some((game) => game === value);

/** Reads `{ games: [{ game, plays }] }`, keeping only known games */
function parsePlays(body: unknown): GamePlays[] {
  const games: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'games') : null;
  if (!Array.isArray(games)) {
    return [];
  }
  return games.flatMap((item: unknown) => {
    const game: unknown = typeof item === 'object' && item !== null ? Reflect.get(item, 'game') : null;
    const plays: unknown = typeof item === 'object' && item !== null ? Reflect.get(item, 'plays') : null;
    return isGameSlug(game) && typeof plays === 'number' ? [{ game, plays }] : [];
  });
}

/** Reads `{ games: [{ game, enabled }] }`, keeping only known games */
function parseSwitches(body: unknown): GameSwitch[] {
  const games: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'games') : null;
  if (!Array.isArray(games)) {
    return [];
  }
  return games.flatMap((item: unknown) => {
    const game: unknown = typeof item === 'object' && item !== null ? Reflect.get(item, 'game') : null;
    const enabled: unknown = typeof item === 'object' && item !== null ? Reflect.get(item, 'enabled') : null;
    return isGameSlug(game) && typeof enabled === 'boolean' ? [{ game, enabled }] : [];
  });
}

/** Reads `{ words: string[] }` */
function parseWords(body: unknown): string[] {
  const words: unknown = typeof body === 'object' && body !== null ? Reflect.get(body, 'words') : null;
  return Array.isArray(words) ? words.filter((word: unknown): word is string => typeof word === 'string') : [];
}

/**
 * Talks to api.su-labs.dev: anonymous play counts, feedback, word reports and suggestions. Only called from the
 * browser. The API is a nice-to-have: when it can't be reached, reads give empty results and sends report failure,
 * and the games carry on as before.
 */
@Injectable({ providedIn: 'root' })
export class GamesApi {
  private readonly document = inject(DOCUMENT);

  private get baseUrl(): string {
    return this.document.location.hostname === 'localhost' ? LOCAL_API_URL : API_URL;
  }

  /** One more play of a game, counted when the player actually starts playing */
  countPlay(game: GameSlug): void {
    void this.send('/v1/plays', { game });
  }

  /** Plays per game over the last 30 days */
  async plays(): Promise<GamePlays[]> {
    return parsePlays(await this.read('/v1/plays'));
  }

  sendFeedback(game: GameSlug, vote: Vote, language: LanguageId, reason?: FeedbackReason): Promise<boolean> {
    return this.send('/v1/feedback', { game, vote, language, reason });
  }

  reportWord(word: string, language: LanguageId): Promise<boolean> {
    return this.send('/v1/word-reports', { word, language });
  }

  /** Words players reported that don't count in the word builder for now */
  async hiddenWords(language: LanguageId): Promise<string[]> {
    return parseWords(await this.read(`/v1/word-reports/hidden?language=${language}`));
  }

  /** The suggestions form, as multipart form data (category, text, language and an optional image) */
  sendSuggestion(form: FormData): Promise<boolean> {
    return this.send('/v1/suggestions', form);
  }

  /** The games the admin switched on or off */
  async gameSwitches(): Promise<GameSwitch[]> {
    return parseSwitches(await this.read('/v1/games'));
  }

  /** Whether an admin token is right, or the API couldn't be asked */
  async checkAdmin(token: string): Promise<'right' | 'wrong' | 'offline'> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/check`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      });
      return response.ok ? 'right' : response.status === 401 ? 'wrong' : 'offline';
    } catch {
      return 'offline';
    }
  }

  /** Opens or closes a game to the public; needs the admin token */
  setGameEnabled(token: string, game: GameSlug, enabled: boolean): Promise<boolean> {
    return this.request(
      `/admin/games/${game}`,
      {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      },
      SEND_TIMEOUT_MS,
    );
  }

  private async read(path: string): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, { signal: AbortSignal.timeout(READ_TIMEOUT_MS) });
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  }

  private send(path: string, body: object | FormData): Promise<boolean> {
    const init: RequestInit =
      body instanceof FormData
        ? { method: 'POST', body }
        : { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } };
    return this.request(path, init, SEND_TIMEOUT_MS);
  }

  /** Whether a request succeeded; false when it failed, timed out or couldn't reach the API */
  private async request(path: string, init: RequestInit, timeoutMs: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      return response.ok;
    } catch {
      return false;
    }
  }
}
