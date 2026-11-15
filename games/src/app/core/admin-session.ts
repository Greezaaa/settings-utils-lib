import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';
import { credentialedFetch, field, jsonInit, READ_TIMEOUT_MS, SEND_TIMEOUT_MS } from './api-url';
import { rememberSignedIn } from './session-hint';

export type AdminRole = 'super' | 'moderator' | 'tester';
export type SignInAnswer = 'right' | 'wrong' | 'too-many' | 'offline';
export type Restored = 'signed-in' | 'signed-out' | 'offline';

export interface Me {
  readonly email: string;
  readonly role: AdminRole;
}

export function failedSignIn(status: number): Exclude<SignInAnswer, 'right'> {
  if (status === 429) {
    return 'too-many';
  }
  return status === 400 || status === 401 || status === 404 ? 'wrong' : 'offline';
}

export const canPreview = (role: AdminRole | undefined): boolean => role === 'super' || role === 'tester';

const ADMIN_ROLES: readonly AdminRole[] = ['super', 'moderator', 'tester'];
export const isAdminRole = (value: unknown): value is AdminRole => ADMIN_ROLES.some((role) => role === value);

function parseMe(body: unknown): Me | null {
  const [email, role] = ['email', 'role'].map((key) => field(body, key));
  return typeof email === 'string' && isAdminRole(role) ? { email, role } : null;
}

@Injectable({ providedIn: 'root' })
export class AdminSession {
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
    return this.startSession(await this.fetch('/auth/login', jsonInit('POST', { email, password }), SEND_TIMEOUT_MS));
  }

  async acceptInvite(secret: string, password: string): Promise<boolean> {
    const path = `/auth/invite/${encodeURIComponent(secret)}`;
    return (
      (await this.startSession(await this.fetch(path, jsonInit('POST', { password }), SEND_TIMEOUT_MS))) === 'right'
    );
  }

  async signOut(): Promise<void> {
    await this.fetch('/auth/logout', { method: 'POST' }, READ_TIMEOUT_MS);
    this.setMe(null);
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
    const response = await this.fetch('/auth/me', {}, READ_TIMEOUT_MS);
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

  private fetch(path: string, init: RequestInit, timeoutMs: number): Promise<Response | null> {
    return credentialedFetch(this.document, path, init, timeoutMs, 'auth');
  }
}
