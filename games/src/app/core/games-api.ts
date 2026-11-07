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

  private async read(path: string): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`);
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  }

  private async send(path: string, body: object | FormData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        ...(body instanceof FormData
          ? { body }
          : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
