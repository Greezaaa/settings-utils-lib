import { DOCUMENT, inject, Injectable } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { apiUrl, field, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { FEATURE_IDS, FeatureId } from './features';
import { GAME_SLUGS, GameSlug } from './games';

/** Preset feedback reasons, as the API accepts them; no free text, so nothing personal can be sent */
export const FEEDBACK_REASONS = {
  up: ['fun', 'learned'],
  down: ['too-easy', 'too-hard', 'boring', 'confusing', 'bug'],
} as const;
export type Vote = keyof typeof FEEDBACK_REASONS;
export type FeedbackReason = (typeof FEEDBACK_REASONS)[Vote][number];

export const SUGGESTION_CATEGORIES = ['new-game', 'improvement', 'drawing', 'problem', 'other'] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

/** A game the admin switched on or off */
export interface GameSwitch {
  readonly game: GameSlug;
  readonly enabled: boolean;
}

/** An error the site hit (see ReportingErrorHandler) */
export interface SiteError {
  /** A short code, e.g. `js` */
  readonly code: string;
  readonly title: string;
  readonly problem: string;
  /** The page, without its query */
  readonly path: string;
}

export interface GamePlays {
  readonly game: GameSlug;
  readonly plays: number;
}

export const isGameSlug = (value: unknown): value is GameSlug => GAME_SLUGS.some((game) => game === value);

/** One `{ game, plays }`, or nothing when the game is unknown or the count isn't a number */
export function parseGamePlays(item: unknown): GamePlays[] {
  const game = field(item, 'game');
  const plays = field(item, 'plays');
  return isGameSlug(game) && typeof plays === 'number' ? [{ game, plays }] : [];
}

/** Reads `{ games: [{ game, plays }] }`, keeping only known games */
function parsePlays(body: unknown): GamePlays[] {
  const games = field(body, 'games');
  return Array.isArray(games) ? games.flatMap((item: unknown) => parseGamePlays(item)) : [];
}

/** Reads `{ games: [{ game, enabled }] }`, keeping only known games */
/** The switches in the API's answer, or null when there's no answer (so the ones known stay) */
function parseSwitches(body: unknown): GameSwitch[] | null {
  const games = field(body, 'games');
  if (!Array.isArray(games)) {
    return null;
  }
  return games.flatMap((item: unknown) => {
    const game = field(item, 'game');
    const enabled = field(item, 'enabled');
    return isGameSlug(game) && typeof enabled === 'boolean' ? [{ game, enabled }] : [];
  });
}

/** A feature the admin switched on or off */
export interface FeatureSwitch {
  readonly feature: FeatureId;
  readonly enabled: boolean;
}

const isFeatureId = (value: unknown): value is FeatureId => FEATURE_IDS.some((feature) => feature === value);

/** Reads `{ features: [{ feature, enabled }] }`, keeping only known features */
/** The feature switches in the API's answer, or null when there's no answer (so the ones known stay) */
function parseFeatureSwitches(body: unknown): FeatureSwitch[] | null {
  const features = field(body, 'features');
  if (!Array.isArray(features)) {
    return null;
  }
  return features.flatMap((item: unknown) => {
    const feature = field(item, 'feature');
    const enabled = field(item, 'enabled');
    return isFeatureId(feature) && typeof enabled === 'boolean' ? [{ feature, enabled }] : [];
  });
}

/** Reads `{ words: string[] }` */
function parseWords(body: unknown): string[] {
  const words = field(body, 'words');
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

  /** An error this page hit, for the admin's error log: what went wrong and the page, nothing about the visitor */
  reportError(error: SiteError): Promise<boolean> {
    return this.send('/v1/errors', error);
  }

  /** Words players reported that don't count in the word builder for now */
  async hiddenWords(language: LanguageId): Promise<string[]> {
    return parseWords(await this.read(`/v1/word-reports/hidden?language=${language}`));
  }

  /** The suggestions form, as multipart form data (category, text, language and an optional image) */
  sendSuggestion(form: FormData): Promise<boolean> {
    return this.send('/v1/suggestions', form);
  }

  /** The features the admin switched on or off */
  async featureSwitches(): Promise<FeatureSwitch[] | null> {
    return parseFeatureSwitches(await this.read('/v1/features'));
  }

  /** The games the admin switched on or off; null when the API can't be reached */
  async gameSwitches(): Promise<GameSwitch[] | null> {
    return parseSwitches(await this.read('/v1/games'));
  }

  private async read(path: string): Promise<unknown> {
    try {
      // Never from the browser's cache: switches and counts must be the API's latest
      const response = await fetch(apiUrl(this.document, path), {
        cache: 'no-store',
        signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      });
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
      const response = await fetch(apiUrl(this.document, path), { ...init, signal: AbortSignal.timeout(timeoutMs) });
      return response.ok;
    } catch {
      return false;
    }
  }
}
