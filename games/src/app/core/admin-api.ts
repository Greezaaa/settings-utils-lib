import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LANGUAGE_IDS, LanguageId } from '../i18n/site-messages';
import { ApiService, credentialedFetch, field, jsonInit, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { FeatureId } from './features';
import { GameCategory, GameSlug } from './games';
import { GamePlays, isFeatureId, isGameSlug, isUpdateKind, parseGamePlays, SUGGESTION_CATEGORIES, SuggestionCategory } from './games-api';
import { UpdateKind } from './site-updates';
import { rememberSignedIn } from './session-hint';

const LANGUAGES: readonly LanguageId[] = ['en', 'es', 'eu', 'it', 'uk'];
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

export interface ModeratedPlayer {
  readonly id: string;
  readonly screenName: string;
  readonly removedFromBoards: boolean;
  readonly joined: string;
}

export interface PendingName {
  readonly id: string;
  readonly screenName: string;
  readonly reports: number;
}

export const STATS_PERIODS = ['day', 'week', 'month', 'year', 'all'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];

export type AdminRole = 'super' | 'moderator' | 'tester';
export const MEMBER_ROLES = ['moderator', 'tester'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type SignInAnswer = 'right' | 'wrong' | 'too-many' | 'offline';

export function failedSignIn(status: number): Exclude<SignInAnswer, 'right'> {
  if (status === 429) {
    return 'too-many';
  }
  return status === 400 || status === 401 || status === 404 ? 'wrong' : 'offline';
}

export const canPreview = (role: AdminRole | undefined): boolean => role === 'super' || role === 'tester';

export type Restored = 'signed-in' | 'signed-out' | 'offline';

export interface Me {
  readonly email: string;
  readonly role: AdminRole;
}

export interface TeamMember {
  readonly id: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly active: boolean;
  readonly invited: boolean;
}

export interface Invite {
  readonly secret: string;
  readonly expires: Date;
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

export const ERROR_SOURCES = ['api', 'site'] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];

export interface LoggedError {
  readonly id: string;
  readonly source: ErrorSource;
  readonly code: string;
  readonly title: string;
  readonly problem: string;
  readonly path: string;
  readonly count: number;
  readonly firstSeen: string;
  readonly lastSeen: string;
}

function parseError(item: unknown): LoggedError[] {
  const [id, source, code, title, problem, path, count, firstSeen, lastSeen] = [
    'id',
    'source',
    'code',
    'title',
    'problem',
    'path',
    'count',
    'firstSeen',
    'lastSeen',
  ].map((key) => field(item, key));
  return typeof id === 'string' &&
    oneOf(ERROR_SOURCES)(source) &&
    typeof code === 'string' &&
    typeof title === 'string' &&
    typeof problem === 'string' &&
    typeof path === 'string' &&
    typeof count === 'number' &&
    typeof firstSeen === 'string' &&
    typeof lastSeen === 'string'
    ? [{ id, source, code, title, problem, path, count, firstSeen, lastSeen }]
    : [];
}

function parsePlayer(item: unknown): ModeratedPlayer[] {
  const [id, screenName, removedFromBoards, created] = ['id', 'screenName', 'removedFromBoards', 'created'].map((key) =>
    field(item, key),
  );
  return typeof id === 'string' &&
    typeof screenName === 'string' &&
    typeof removedFromBoards === 'boolean' &&
    typeof created === 'string'
    ? [{ id, screenName, removedFromBoards, joined: created.slice(0, 10) }]
    : [];
}

function parsePendingName(item: unknown): PendingName[] {
  const [id, screenName, reports] = ['id', 'screenName', 'reports'].map((key) => field(item, key));
  return typeof id === 'string' && typeof screenName === 'string' && typeof reports === 'number'
    ? [{ id, screenName, reports }]
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

const isRole = oneOf<AdminRole>(['super', 'moderator', 'tester']);

function parseMe(body: unknown): Me | null {
  const [email, role] = ['email', 'role'].map((key) => field(body, key));
  return typeof email === 'string' && isRole(role) ? { email, role } : null;
}

function parseMember(item: unknown): TeamMember[] {
  const [id, email, role, active, invited] = ['id', 'email', 'role', 'active', 'invited'].map((key) =>
    field(item, key),
  );
  return typeof id === 'string' &&
    typeof email === 'string' &&
    isRole(role) &&
    typeof active === 'boolean' &&
    typeof invited === 'boolean'
    ? [{ id, email, role, active, invited }]
    : [];
}

function parseInvite(body: unknown): Invite | null {
  const [secret, expires] = ['secret', 'expires'].map((key) => field(body, key));
  return typeof secret === 'string' && typeof expires === 'string' ? { secret, expires: new Date(expires) } : null;
}

export const ADMIN_PAGE_SIZE = 50;

const pageQuery = (status: string, offset: number): string =>
  `status=${status}&offset=${offset}&limit=${ADMIN_PAGE_SIZE}`;

const listOf = <T>(body: unknown, parse: (item: unknown) => T[]): T[] =>
  Array.isArray(body) ? body.flatMap((item: unknown) => parse(item)) : [];

export interface NewsDraft {
  readonly kind: UpdateKind;
  readonly game: GameSlug | null;
  readonly feature: FeatureId | null;
  readonly privacy: boolean;
  readonly published: string;
  readonly text: Partial<Record<LanguageId, string>>;
}

export interface AdminNews extends NewsDraft {
  readonly id: number;
  readonly version: number;
}

function parseAdminNews(item: unknown): AdminNews[] {
  const [id, version, published, kind, game, feature, privacy, text] = ['id', 'version', 'published', 'kind', 'game', 'feature', 'privacy', 'text'].map(
    (name) => field(item, name),
  );
  if (typeof id !== 'number' || typeof version !== 'number' || typeof published !== 'string' || !isUpdateKind(kind)) {
    return [];
  }
  const texts: Partial<Record<LanguageId, string>> = {};
  for (const language of LANGUAGE_IDS) {
    const value = field(text, language);
    if (typeof value === 'string') {
      texts[language] = value;
    }
  }
  return [
    {
      id,
      version,
      published,
      kind,
      game: isGameSlug(game) ? game : null,
      feature: isFeatureId(feature) ? feature : null,
      privacy: privacy === true,
      text: texts,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly document = inject(DOCUMENT);
  private readonly signedIn = signal<Me | null>(null);
  private restored?: Promise<Restored>;

  readonly me = this.signedIn.asReadonly();
  readonly isSignedIn = computed(() => this.signedIn() !== null);
  readonly isSuper = computed(() => this.signedIn()?.role === 'super');
  readonly canPreview = computed(() => canPreview(this.signedIn()?.role));

  async restore(): Promise<Restored> {
    this.restored ??= this.askSession();
    const answer = await this.restored;
    if (answer === 'offline') {
      this.restored = undefined;
    }
    return answer === 'offline' ? answer : this.signedIn() ? 'signed-in' : 'signed-out';
  }

  async signIn(email: string, password: string): Promise<SignInAnswer> {
    return this.startSession(await this.fetch('/auth/login', jsonInit('POST', { email, password }), SEND_TIMEOUT_MS, 'auth'));
  }

  async signOut(): Promise<void> {
    await this.fetch('/auth/logout', { method: 'POST' }, READ_TIMEOUT_MS, 'auth');
    this.setMe(null);
  }

  async changePassword(current: string, next: string): Promise<'saved' | 'wrong' | 'offline'> {
    const response = await this.fetch('/auth/password', jsonInit('POST', { current, next }), SEND_TIMEOUT_MS, 'auth');
    return !response ? 'offline' : response.ok ? 'saved' : response.status === 401 ? 'wrong' : 'offline';
  }

  async inviteEmail(secret: string): Promise<string | null> {
    const email = field(await this.read(`/auth/invite/${encodeURIComponent(secret)}`, 'auth'), 'email');
    return typeof email === 'string' ? email : null;
  }

  async acceptInvite(secret: string, password: string): Promise<boolean> {
    const path = `/auth/invite/${encodeURIComponent(secret)}`;
    return (
      (await this.startSession(await this.fetch(path, jsonInit('POST', { password }), SEND_TIMEOUT_MS, 'auth'))) === 'right'
    );
  }

  async team(): Promise<TeamMember[]> {
    return listOf(await this.read('/admin/team', 'auth'), parseMember);
  }

  async addMember(
    email: string,
    role: MemberRole,
    password?: string,
  ): Promise<{ invite: Invite | null } | 'exists' | 'failed'> {
    const response = await this.fetch('/admin/team', jsonInit('POST', { email, role, password }), SEND_TIMEOUT_MS, 'auth');
    if (response?.status === 409) {
      return 'exists';
    }
    return response?.ok ? { invite: parseInvite(field(await response.json(), 'invite')) } : 'failed';
  }

  async reinvite(id: string): Promise<Invite | null> {
    const response = await this.fetch(`/admin/team/${id}/invite`, { method: 'POST' }, SEND_TIMEOUT_MS, 'auth');
    return response?.ok ? parseInvite(await response.json()) : null;
  }

  setRole(id: string, role: MemberRole): Promise<boolean> {
    return this.change('PATCH', `/admin/team/${id}`, { role }, 'auth');
  }

  setActive(id: string, active: boolean): Promise<boolean> {
    return this.change('PATCH', `/admin/team/${id}`, { active }, 'auth');
  }

  setFeatureEnabled(feature: FeatureId, enabled: boolean): Promise<boolean> {
    return this.change('PUT', `/admin/features/${feature}`, { enabled });
  }

  setGameEnabled(game: GameSlug, enabled: boolean): Promise<boolean> {
    return this.change('PUT', `/admin/games/${game}`, { enabled });
  }

  setGameCategories(game: GameSlug, categories: readonly GameCategory[]): Promise<boolean> {
    return this.change('PUT', `/admin/games/${game}/categories`, { categories });
  }

  setGameThumbnail(game: GameSlug, picture: Blob): Promise<boolean> {
    const form = new FormData();
    form.append('image', picture, 'thumbnail.webp');
    return this.change('PUT', `/admin/games/${game}/thumbnail`, form);
  }

  removeGameThumbnail(game: GameSlug): Promise<boolean> {
    return this.change('DELETE', `/admin/games/${game}/thumbnail`);
  }

  async news(): Promise<AdminNews[]> {
    return listOf(field(await this.read('/v1/news'), 'news'), parseAdminNews);
  }

  addNews(draft: NewsDraft): Promise<boolean> {
    return this.change('POST', '/admin/news', draft);
  }

  changeNews(id: number, draft: NewsDraft): Promise<boolean> {
    return this.change('PUT', `/admin/news/${id}`, draft);
  }

  removeNews(id: number): Promise<boolean> {
    return this.change('DELETE', `/admin/news/${id}`);
  }

  async suggestions(status: SuggestionStatus, offset: number): Promise<AdminSuggestion[]> {
    return listOf(await this.read(`/admin/suggestions?${pageQuery(status, offset)}`), parseSuggestion);
  }

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

  async errors(): Promise<LoggedError[]> {
    return listOf(await this.read('/admin/errors'), parseError);
  }

  deleteError(id: string): Promise<boolean> {
    return this.change('DELETE', `/admin/errors/${id}`);
  }

  clearErrors(): Promise<boolean> {
    return this.change('DELETE', '/admin/errors');
  }

  async wordReports(status: ReportStatus, offset: number): Promise<WordReport[]> {
    return listOf(await this.read(`/admin/word-reports?${pageQuery(status, offset)}`), parseReport);
  }

  decideWord(report: WordReport, status: 'approved' | 'rejected'): Promise<boolean> {
    return this.change('PATCH', `/admin/word-reports/${report.language}/${encodeURIComponent(report.word)}`, {
      status,
    });
  }

  async players(offset: number): Promise<ModeratedPlayer[]> {
    return listOf(await this.read(`/admin/players?offset=${offset}&limit=${ADMIN_PAGE_SIZE}`), parsePlayer);
  }

  async renamePlayer(id: string): Promise<string | null> {
    const response = await this.fetch(`/admin/players/${id}/rename`, { method: 'POST' }, SEND_TIMEOUT_MS);
    const screenName = response?.ok ? field(await response.json(), 'screenName') : null;
    return typeof screenName === 'string' ? screenName : null;
  }

  async pendingNames(offset: number): Promise<PendingName[]> {
    return listOf(await this.read(`/admin/players/names?offset=${offset}&limit=${ADMIN_PAGE_SIZE}`), parsePendingName);
  }

  approveName(id: string): Promise<boolean> {
    return this.change('POST', `/admin/players/${id}/approve-name`);
  }

  setPlayerRemoved(id: string, removedFromBoards: boolean): Promise<boolean> {
    return this.change('PATCH', `/admin/players/${id}`, { removedFromBoards });
  }

  async feedback(period: StatsPeriod): Promise<GameFeedback[]> {
    return listOf(await this.read(`/admin/feedback?period=${period}`), parseFeedback);
  }

  resetStats(): Promise<boolean> {
    return this.change('DELETE', '/admin/stats');
  }

  async plays(period: StatsPeriod): Promise<GamePlays[]> {
    return listOf(await this.read(`/admin/plays?period=${period}`), parseGamePlays);
  }

  private async read(path: string, service: ApiService = 'api'): Promise<unknown> {
    const response = await this.fetch(path, {}, READ_TIMEOUT_MS, service);
    return response?.ok ? response.json() : null;
  }

  private async change(
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: object | FormData,
    service: ApiService = 'api',
  ): Promise<boolean> {
    const init: RequestInit = body instanceof FormData ? { method, body } : body ? jsonInit(method, body) : { method };
    return (await this.fetch(path, init, SEND_TIMEOUT_MS, service))?.ok ?? false;
  }

  private async startSession(response: Response | null): Promise<SignInAnswer> {
    if (!response) {
      return 'offline';
    }
    if (!response.ok) {
      return failedSignIn(response.status);
    }
    this.setMe(parseMe(await response.json()));
    return 'right';
  }

  private async askSession(): Promise<Restored> {
    const response = await this.fetch('/auth/me', {}, READ_TIMEOUT_MS, 'auth');
    if (!response) {
      return 'offline';
    }
    this.setMe(response.ok ? parseMe(await response.json()) : null);
    return this.signedIn() ? 'signed-in' : 'signed-out';
  }

  private setMe(me: Me | null): void {
    this.signedIn.set(me);
    rememberSignedIn('admin', me !== null);
  }

  private fetch(path: string, init: RequestInit, timeoutMs: number, service: ApiService = 'api'): Promise<Response | null> {
    return credentialedFetch(this.document, path, init, timeoutMs, service);
  }
}
