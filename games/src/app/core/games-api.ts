import { DOCUMENT, inject, Injectable } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { apiUrl, field, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { FEATURE_IDS, FeatureId } from './features';
import { NewsItem, UPDATE_KINDS, UpdateKind } from './site-updates';
import { GAME_CATEGORIES, GAME_SLUGS, GameCategory, GameSlug } from './games';
import { OutboxItem, readOutbox, SendResult, withItem, writeOutbox } from './outbox';

export const FEEDBACK_REASONS = {
  up: ['fun', 'learned'],
  down: ['too-easy', 'too-hard', 'boring', 'confusing', 'bug'],
} as const;
export type Vote = keyof typeof FEEDBACK_REASONS;
export type FeedbackReason = (typeof FEEDBACK_REASONS)[Vote][number];

export const SUGGESTION_CATEGORIES = ['new-game', 'improvement', 'drawing', 'problem', 'other'] as const;
export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

export interface GameSwitch {
  readonly game: GameSlug;
  readonly enabled: boolean;
}

export interface GameCategoryList {
  readonly game: GameSlug;
  readonly categories: readonly GameCategory[];
}

export interface ThumbnailVersion {
  readonly game: GameSlug;
  readonly version: number;
}

export interface GameSettings {
  readonly switches: readonly GameSwitch[];
  readonly categories: readonly GameCategoryList[];
  readonly thumbnails: readonly ThumbnailVersion[];
}

export interface SiteError {
  readonly code: string;
  readonly title: string;
  readonly problem: string;
  readonly path: string;
}

export interface GamePlays {
  readonly game: GameSlug;
  readonly plays: number;
}

export const isGameSlug = (value: unknown): value is GameSlug => GAME_SLUGS.some((game) => game === value);

export const isGameCategory = (value: unknown): value is GameCategory =>
  GAME_CATEGORIES.some((category) => category === value);

export function parseGamePlays(item: unknown): GamePlays[] {
  const game = field(item, 'game');
  const plays = field(item, 'plays');
  return isGameSlug(game) && typeof plays === 'number' ? [{ game, plays }] : [];
}

function parsePlays(body: unknown): GamePlays[] {
  const games = field(body, 'games');
  return Array.isArray(games) ? games.flatMap((item: unknown) => parseGamePlays(item)) : [];
}

function parseCategories(item: unknown): GameCategoryList[] {
  const game = field(item, 'game');
  const categories = field(item, 'categories');
  const known = Array.isArray(categories) ? categories.filter((category: unknown) => isGameCategory(category)) : [];
  return isGameSlug(game) && known.length > 0 ? [{ game, categories: known }] : [];
}

export function parseThumbnails(list: unknown): ThumbnailVersion[] {
  return Array.isArray(list)
    ? list.flatMap((item: unknown) => {
        const game = field(item, 'game');
        const version = field(item, 'version');
        return isGameSlug(game) && typeof version === 'number' && Number.isInteger(version) ? [{ game, version }] : [];
      })
    : [];
}

function parseGameSettings(body: unknown): GameSettings | null {
  const games = field(body, 'games');
  if (!Array.isArray(games)) {
    return null;
  }
  const switches = games.flatMap((item: unknown) => {
    const game = field(item, 'game');
    const enabled = field(item, 'enabled');
    return isGameSlug(game) && typeof enabled === 'boolean' ? [{ game, enabled }] : [];
  });
  const lists = field(body, 'categories');
  const categories = Array.isArray(lists) ? lists.flatMap((item: unknown) => parseCategories(item)) : [];
  return { switches, categories, thumbnails: parseThumbnails(field(body, 'thumbnails')) };
}

export interface FeatureSwitch {
  readonly feature: FeatureId;
  readonly enabled: boolean;
}

export const isFeatureId = (value: unknown): value is FeatureId => FEATURE_IDS.some((feature) => feature === value);

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

export const isUpdateKind = (value: unknown): value is UpdateKind => UPDATE_KINDS.some((kind) => kind === value);

export function parseNewsItem(item: unknown): NewsItem[] {
  const [version, published, kind, game, feature, privacy, text] = ['version', 'published', 'kind', 'game', 'feature', 'privacy', 'text'].map(
    (name) => field(item, name),
  );
  const spanish = field(text, 'es');
  if (typeof version !== 'number' || typeof published !== 'string' || !isUpdateKind(kind) || typeof spanish !== 'string') {
    return [];
  }
  const inLanguage = (language: LanguageId): string => {
    const own = field(text, language);
    return typeof own === 'string' && own.trim() ? own : spanish;
  };
  const change = {
    kind,
    text: { en: inLanguage('en'), es: spanish, eu: inLanguage('eu'), it: inLanguage('it'), uk: inLanguage('uk') },
    ...(isGameSlug(game) ? { game } : {}),
    ...(isFeatureId(feature) ? { feature } : {}),
  };
  return [{ version, published, privacy: privacy === true, change }];
}

function parseWords(body: unknown): string[] {
  const words = field(body, 'words');
  return Array.isArray(words) ? words.filter((word: unknown): word is string => typeof word === 'string') : [];
}

const SERVER_ERROR = 500;

@Injectable({ providedIn: 'root' })
export class GamesApi {
  private readonly document = inject(DOCUMENT);
  countPlay(game: GameSlug): void {
    void this.sendOrQueue({ path: '/v1/plays', body: { game } });
  }

  async plays(): Promise<GamePlays[]> {
    return parsePlays(await this.read('/v1/plays'));
  }

  sendFeedback(game: GameSlug, vote: Vote, language: LanguageId, reason?: FeedbackReason): Promise<boolean> {
    return this.sendOrQueue({ path: '/v1/feedback', body: { game, vote, language, reason } });
  }

  reportWord(word: string, language: LanguageId): Promise<boolean> {
    return this.sendOrQueue({ path: '/v1/word-reports', body: { word, language } });
  }

  reportName(screenName: string): Promise<boolean> {
    return this.send('/v1/name-reports', { screenName });
  }

  reportError(error: SiteError): Promise<boolean> {
    return this.send('/v1/errors', error);
  }

  async hiddenWords(language: LanguageId): Promise<string[]> {
    return parseWords(await this.read(`/v1/word-reports/hidden?language=${language}`));
  }

  sendSuggestion(form: FormData): Promise<boolean> {
    return this.send('/v1/suggestions', form);
  }

  async featureSwitches(): Promise<FeatureSwitch[] | null> {
    return parseFeatureSwitches(await this.read('/v1/features'));
  }

  async news(): Promise<NewsItem[] | null> {
    const news = field(await this.read('/v1/news'), 'news');
    return Array.isArray(news) ? news.flatMap((item: unknown) => parseNewsItem(item)) : null;
  }

  async gameSettings(): Promise<GameSettings | null> {
    return parseGameSettings(await this.read('/v1/games'));
  }

  private async read(path: string): Promise<unknown> {
    try {
      const response = await fetch(apiUrl(this.document, path), {
        cache: 'no-cache',
        signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      });
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  }

  private async send(path: string, body: object | FormData): Promise<boolean> {
    return (await this.post(path, body)) === 'sent';
  }

  private async sendOrQueue(item: OutboxItem): Promise<boolean> {
    const result = await this.post(item.path, item.body);
    if (result === 'unreachable') {
      writeOutbox(withItem(readOutbox(), item));
    }
    return result !== 'rejected';
  }

  sendQueued(item: OutboxItem): Promise<SendResult> {
    return this.post(item.path, item.body);
  }

  private async post(path: string, body: object | FormData): Promise<SendResult> {
    const init: RequestInit =
      body instanceof FormData
        ? { method: 'POST', body }
        : { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } };
    try {
      const response = await fetch(apiUrl(this.document, path), { ...init, signal: AbortSignal.timeout(SEND_TIMEOUT_MS) });
      if (response.ok) {
        return 'sent';
      }
      return response.status >= SERVER_ERROR ? 'unreachable' : 'rejected';
    } catch {
      return 'unreachable';
    }
  }
}
