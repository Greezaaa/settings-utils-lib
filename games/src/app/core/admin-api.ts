import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { apiUrl, field, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { GameSlug } from './games';
import { isGameSlug, SUGGESTION_CATEGORIES, SuggestionCategory } from './games-api';

/** Keeps the token for this tab only, so the admin can reload without typing it again; gone when the tab closes */
const TOKEN_SESSION_KEY = 'su-labs-games:admin-token';

const LANGUAGES: readonly LanguageId[] = ['en', 'es', 'eu', 'uk'];
const isLanguage = (value: unknown): value is LanguageId => LANGUAGES.some((language) => language === value);

export const SUGGESTION_STATUSES = ['new', 'read', 'archived'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];
export const REPORT_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface AdminSuggestion {
  readonly id: string;
  readonly category: SuggestionCategory;
  readonly text: string;
  readonly language: LanguageId;
  readonly hasImage: boolean;
  readonly status: SuggestionStatus;
  readonly created: Date;
}

export interface WordReport {
  readonly word: string;
  readonly language: LanguageId;
  readonly reports: number;
  readonly status: ReportStatus;
  readonly firstReported: string;
}

export interface GameFeedback {
  readonly game: GameSlug;
  readonly up: number;
  readonly down: number;
  readonly reasons: ReadonlyMap<string, number>;
}

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (value: unknown): value is T =>
    values.some((item) => item === value);

function parseSuggestion(item: unknown): AdminSuggestion[] {
  const [id, category, text, language, image, status, created] = [
    'id',
    'category',
    'text',
    'language',
    'image',
    'status',
    'created',
  ].map((key) => field(item, key));
  return typeof id === 'string' &&
    oneOf(SUGGESTION_CATEGORIES)(category) &&
    typeof text === 'string' &&
    isLanguage(language) &&
    oneOf(SUGGESTION_STATUSES)(status) &&
    typeof created === 'string'
    ? [{ id, category, text, language, hasImage: typeof image === 'string', status, created: new Date(created) }]
    : [];
}

function parseReport(item: unknown): WordReport[] {
  const [word, language, reports, status, firstReported] = [
    'word',
    'language',
    'reports',
    'status',
    'firstReported',
  ].map((key) => field(item, key));
  return typeof word === 'string' &&
    isLanguage(language) &&
    typeof reports === 'number' &&
    oneOf(REPORT_STATUSES)(status) &&
    typeof firstReported === 'string'
    ? [{ word, language, reports, status, firstReported }]
    : [];
}

function parseFeedback(item: unknown): GameFeedback[] {
  const [game, up, down, reasons] = ['game', 'up', 'down', 'reasons'].map((key) => field(item, key));
  if (!isGameSlug(game) || typeof up !== 'number' || typeof down !== 'number') {
    return [];
  }
  const counts = new Map<string, number>();
  if (typeof reasons === 'object' && reasons !== null) {
    for (const [reason, count] of Object.entries(reasons)) {
      if (typeof count === 'number') {
        counts.set(reason, count);
      }
    }
  }
  return [{ game, up, down, reasons: counts }];
}

/** A JSON list from an answer, each item checked by `parse` (which returns no item when it doesn't fit) */
const listOf = <T>(body: unknown, parse: (item: unknown) => T[]): T[] =>
  Array.isArray(body) ? body.flatMap((item: unknown) => parse(item)) : [];

/**
 * The admin's side of the API: signing in with the admin token, switching games, and moderating suggestions, reported
 * words and feedback. Only the admin page uses it. The token stays in memory and in this tab's session storage.
 */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly document = inject(DOCUMENT);
  private readonly token = signal<string | null>(null);

  readonly isSignedIn = computed(() => this.token() !== null);

  /** Signs in with a token; the answer tells a wrong token from an API that can't be reached */
  async signIn(token: string): Promise<'right' | 'wrong' | 'offline'> {
    try {
      const response = await fetch(apiUrl(this.document, '/admin/check'), {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      });
      if (response.ok) {
        this.token.set(token);
        sessionStorage.setItem(TOKEN_SESSION_KEY, token);
        return 'right';
      }
      return response.status === 401 ? 'wrong' : 'offline';
    } catch {
      return 'offline';
    }
  }

  /** The token kept from earlier in this tab, if any */
  savedToken(): string | null {
    return sessionStorage.getItem(TOKEN_SESSION_KEY);
  }

  signOut(): void {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    this.token.set(null);
  }

  setGameEnabled(game: GameSlug, enabled: boolean): Promise<boolean> {
    return this.change('PUT', `/admin/games/${game}`, { enabled });
  }

  async suggestions(status: SuggestionStatus): Promise<AdminSuggestion[]> {
    return listOf(await this.read(`/admin/suggestions?status=${status}`), parseSuggestion);
  }

  /** A suggestion's picture, to show with an object URL */
  async suggestionImage(id: string): Promise<Blob | null> {
    const response = await this.fetch(`/admin/suggestions/${id}/image`, {}, READ_TIMEOUT_MS);
    return response?.ok ? response.blob() : null;
  }

  setSuggestionStatus(id: string, status: SuggestionStatus): Promise<boolean> {
    return this.change('PATCH', `/admin/suggestions/${id}`, { status });
  }

  deleteSuggestion(id: string): Promise<boolean> {
    return this.change('DELETE', `/admin/suggestions/${id}`);
  }

  async wordReports(status: ReportStatus): Promise<WordReport[]> {
    return listOf(await this.read(`/admin/word-reports?status=${status}`), parseReport);
  }

  /** Approved keeps the word out of the word builder; rejected lets it count again */
  decideWord(report: WordReport, status: 'approved' | 'rejected'): Promise<boolean> {
    return this.change('PATCH', `/admin/word-reports/${report.language}/${encodeURIComponent(report.word)}`, {
      status,
    });
  }

  async feedback(): Promise<GameFeedback[]> {
    return listOf(await this.read('/admin/feedback'), parseFeedback);
  }

  private async read(path: string): Promise<unknown> {
    const response = await this.fetch(path, {}, READ_TIMEOUT_MS);
    return response?.ok ? response.json() : null;
  }

  private async change(method: 'PUT' | 'PATCH' | 'DELETE', path: string, body?: object): Promise<boolean> {
    const init: RequestInit = body
      ? { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
      : { method };
    return (await this.fetch(path, init, SEND_TIMEOUT_MS))?.ok ?? false;
  }

  /** A request with the admin token; null when it couldn't reach the API */
  private async fetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response | null> {
    try {
      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${this.token() ?? ''}`);
      return await fetch(apiUrl(this.document, path), { ...init, headers, signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      return null;
    }
  }
}
