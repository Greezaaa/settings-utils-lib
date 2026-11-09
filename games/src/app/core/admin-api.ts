import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { LanguageId } from '../i18n/site-messages';
import { credentialedFetch, field, jsonInit, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { FeatureId } from './features';
import { GameSlug } from './games';
import { GamePlays, isGameSlug, parseGamePlays, SUGGESTION_CATEGORIES, SuggestionCategory } from './games-api';

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

/** The super admin manages everything; moderators and testers moderate, and testers also see everything in preview */
/** Periods the statistics can be shown for (see api/src/shared/period.ts) */
/** Statistics periods, shortest first: today, this week (from Monday), this month, this year, all time */
export const STATS_PERIODS = ['day', 'week', 'month', 'year', 'all'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];

export type AdminRole = 'super' | 'moderator' | 'tester';
/** The roles the super admin gives team members */
export const MEMBER_ROLES = ['moderator', 'tester'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
/** How a sign-in went: `too-many` when the API refuses more tries for now (5 every 15 minutes) */
export type SignInAnswer = 'right' | 'wrong' | 'too-many' | 'offline';

/** What a refused sign-in means, from the API's status */
export function failedSignIn(status: number): Exclude<SignInAnswer, 'right'> {
  if (status === 429) {
    return 'too-many';
  }
  return status === 400 || status === 401 || status === 404 ? 'wrong' : 'offline';
}

/** Roles that see games and features switched off for the public */
export const canPreview = (role: AdminRole | undefined): boolean => role === 'super' || role === 'tester';

/** Who is signed in */
export interface Me {
  readonly email: string;
  readonly role: AdminRole;
}

/** A team member as the super admin sees them */
export interface TeamMember {
  readonly id: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly active: boolean;
  /** Invited and hasn't chosen a password yet */
  readonly invited: boolean;
}

/** An invite link's secret (shown once, to copy) and when it stops working */
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

/** Where an error happened: the API, or a visitor's browser */
export const ERROR_SOURCES = ['api', 'site'] as const;
export type ErrorSource = (typeof ERROR_SOURCES)[number];

/** An error in the log: one row per distinct error, with how often and when it happened */
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

/** A JSON list from an answer, each item checked by `parse` (which returns no item when it doesn't fit) */
/** A request with a JSON body */
const listOf = <T>(body: unknown, parse: (item: unknown) => T[]): T[] =>
  Array.isArray(body) ? body.flatMap((item: unknown) => parse(item)) : [];

/**
 * The admin team's side of the API: signing in with email and password, the team (for the super admin), switching
 * games, and moderating suggestions, reported words and feedback. Only the admin pages use it. The session lives in an
 * HttpOnly cookie for api.su-labs.dev, so no script here can read it.
 */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly document = inject(DOCUMENT);
  private readonly signedIn = signal<Me | null>(null);

  /** Who is signed in, or null */
  readonly me = this.signedIn.asReadonly();
  readonly isSignedIn = computed(() => this.signedIn() !== null);
  readonly isSuper = computed(() => this.signedIn()?.role === 'super');
  /** The super admin and testers see every game and feature in preview */
  readonly canPreview = computed(() => canPreview(this.signedIn()?.role));

  /** Asks the API whether this browser is still signed in (the cookie lasts 30 days) */
  async restore(): Promise<'signed-in' | 'signed-out' | 'offline'> {
    const response = await this.fetch('/auth/me', {}, READ_TIMEOUT_MS);
    if (!response) {
      return 'offline';
    }
    this.signedIn.set(response.ok ? parseMe(await response.json()) : null);
    return this.signedIn() ? 'signed-in' : 'signed-out';
  }

  /** Signs in; the answer tells wrong details, too many tries, and an API that can't be reached apart */
  async signIn(email: string, password: string): Promise<SignInAnswer> {
    return this.startSession(await this.fetch('/auth/login', jsonInit('POST', { email, password }), READ_TIMEOUT_MS));
  }

  async signOut(): Promise<void> {
    await this.fetch('/auth/logout', { method: 'POST' }, READ_TIMEOUT_MS);
    this.signedIn.set(null);
  }

  async changePassword(current: string, next: string): Promise<'saved' | 'wrong' | 'offline'> {
    const response = await this.fetch('/auth/password', jsonInit('POST', { current, next }), SEND_TIMEOUT_MS);
    return !response ? 'offline' : response.ok ? 'saved' : response.status === 401 ? 'wrong' : 'offline';
  }

  /** The email an invite link is for, or null when it's wrong, used or expired */
  async inviteEmail(secret: string): Promise<string | null> {
    const email = field(await this.read(`/auth/invite/${encodeURIComponent(secret)}`), 'email');
    return typeof email === 'string' ? email : null;
  }

  /** Accepts an invite with the chosen password, which also signs in */
  async acceptInvite(secret: string, password: string): Promise<boolean> {
    const path = `/auth/invite/${encodeURIComponent(secret)}`;
    return (
      (await this.startSession(await this.fetch(path, jsonInit('POST', { password }), SEND_TIMEOUT_MS))) === 'right'
    );
  }

  async team(): Promise<TeamMember[]> {
    return listOf(await this.read('/admin/team'), parseMember);
  }

  /** Adds a moderator or tester with a starting password, or with an invite link when there is none */
  async addMember(
    email: string,
    role: MemberRole,
    password?: string,
  ): Promise<{ invite: Invite | null } | 'exists' | 'failed'> {
    const response = await this.fetch('/admin/team', jsonInit('POST', { email, role, password }), SEND_TIMEOUT_MS);
    if (response?.status === 409) {
      return 'exists';
    }
    return response?.ok ? { invite: parseInvite(field(await response.json(), 'invite')) } : 'failed';
  }

  async reinvite(id: string): Promise<Invite | null> {
    const response = await this.fetch(`/admin/team/${id}/invite`, { method: 'POST' }, SEND_TIMEOUT_MS);
    return response?.ok ? parseInvite(await response.json()) : null;
  }

  setRole(id: string, role: MemberRole): Promise<boolean> {
    return this.change('PATCH', `/admin/team/${id}`, { role });
  }

  setActive(id: string, active: boolean): Promise<boolean> {
    return this.change('PATCH', `/admin/team/${id}`, { active });
  }

  setFeatureEnabled(feature: FeatureId, enabled: boolean): Promise<boolean> {
    return this.change('PUT', `/admin/features/${feature}`, { enabled });
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

  /** The error log, latest first (super admin only) */
  async errors(): Promise<LoggedError[]> {
    return listOf(await this.read('/admin/errors'), parseError);
  }

  /** Removes one error from the log, once it's fixed */
  deleteError(id: string): Promise<boolean> {
    return this.change('DELETE', `/admin/errors/${id}`);
  }

  clearErrors(): Promise<boolean> {
    return this.change('DELETE', '/admin/errors');
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

  async feedback(period: StatsPeriod): Promise<GameFeedback[]> {
    return listOf(await this.read(`/admin/feedback?period=${period}`), parseFeedback);
  }

  /** Deletes every play and vote counted, so statistics start again from today (super admin) */
  resetStats(): Promise<boolean> {
    return this.change('DELETE', '/admin/stats');
  }

  /** Plays per game in a period */
  async plays(period: StatsPeriod): Promise<GamePlays[]> {
    return listOf(await this.read(`/admin/plays?period=${period}`), parseGamePlays);
  }

  private async read(path: string): Promise<unknown> {
    const response = await this.fetch(path, {}, READ_TIMEOUT_MS);
    return response?.ok ? response.json() : null;
  }

  private async change(method: 'PUT' | 'PATCH' | 'DELETE', path: string, body?: object): Promise<boolean> {
    return (await this.fetch(path, body ? jsonInit(method, body) : { method }, SEND_TIMEOUT_MS))?.ok ?? false;
  }

  /** After a sign-in or an accepted invite: who is signed in now */
  private async startSession(response: Response | null): Promise<SignInAnswer> {
    if (!response) {
      return 'offline';
    }
    if (!response.ok) {
      return failedSignIn(response.status);
    }
    this.signedIn.set(parseMe(await response.json()));
    return 'right';
  }

  /** A request with the session cookie; null when it couldn't reach the API */
  private fetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response | null> {
    return credentialedFetch(this.document, path, init, timeoutMs);
  }
}
