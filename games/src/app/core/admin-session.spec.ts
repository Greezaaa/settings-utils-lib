import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSession, failedSignIn } from './admin-session';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const offline = vi.fn(async () => {
  throw new TypeError('offline');
});

describe('AdminSession', () => {
  let api: AdminSession;

  beforeEach(() => {
    const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }] });
    api = runInInjectionContext(injector, () => new AdminSession());
  });

  afterEach(() => vi.unstubAllGlobals());

  it('signs in with email and password, telling wrong details from an unreachable API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ message: 'Wrong email or password' }, 401)),
    );
    expect(await api.signIn('mod@su-labs.dev', 'nope')).toBe('wrong');
    vi.stubGlobal('fetch', offline);
    expect(await api.signIn('mod@su-labs.dev', 'secret')).toBe('offline');
    const fetchMock = vi.fn(async (..._args: Parameters<typeof fetch>) =>
      json({ email: 'mod@su-labs.dev', role: 'moderator' }, 201),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await api.signIn('mod@su-labs.dev', 'secret')).toBe('right');
    expect(api.me()).toEqual({ email: 'mod@su-labs.dev', role: 'moderator' });
    expect(api.isSuper()).toBe(false);
    expect(fetchMock.mock.calls[0][1]?.credentials).toBe('include');
  });

  it('restores a signed-in browser and signs out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ email: 'boss@su-labs.dev', role: 'super' })),
    );
    expect(await api.restore()).toBe('signed-in');
    expect(api.isSuper()).toBe(true);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await api.signOut();
    expect(api.isSignedIn()).toBe(false);
  });
});

describe('failedSignIn', () => {
  it('tells wrong details, too many tries and an API out of reach apart', () => {
    expect(failedSignIn(401)).toBe('wrong');
    expect(failedSignIn(429)).toBe('too-many');
    expect(failedSignIn(500)).toBe('offline');
  });
});
