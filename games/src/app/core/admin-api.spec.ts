import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_PAGE_SIZE, AdminApi, failedSignIn } from './admin-api';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const offline = vi.fn(async () => {
  throw new TypeError('offline');
});

describe('AdminApi', () => {
  let api: AdminApi;

  beforeEach(() => {
    const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }] });
    api = runInInjectionContext(injector, () => new AdminApi());
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
    // The session travels as a cookie, never as a header the page could read
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

  it('adds team members, with an invite link when there is no password', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ member: {}, invite: { secret: 'abc', expires: '2026-11-15T10:00:00Z' } }, 201)),
    );
    const added = await api.addMember('new@su-labs.dev', 'tester');
    expect(added).toEqual({ invite: { secret: 'abc', expires: new Date('2026-11-15T10:00:00Z') } });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({}, 409)),
    );
    expect(await api.addMember('new@su-labs.dev', 'moderator', 'a starting password')).toBe('exists');
  });

  it('asks for one page of a moderated list, starting after the rows already shown', async () => {
    const fetchMock = vi.fn(async (..._args: Parameters<typeof fetch>) => json([]));
    vi.stubGlobal('fetch', fetchMock);
    await api.suggestions('read', 50);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      `/admin/suggestions?status=read&offset=50&limit=${ADMIN_PAGE_SIZE}`,
    );
  });

  it('keeps only well-formed answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json([
          { word: 'rude', language: 'en', reports: 3, status: 'pending', firstReported: '2026-11-08', decided: null },
          { word: 42 },
        ]),
      ),
    );
    expect(await api.wordReports('pending', 0)).toEqual([
      { word: 'rude', language: 'en', reports: 3, status: 'pending', firstReported: '2026-11-08' },
    ]);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json([{ game: 'math-games', up: 3, down: 1, reasons: { fun: 2 } }])),
    );
    const [feedback] = await api.feedback();
    expect([feedback.game, feedback.up, feedback.down, feedback.reasons.get('fun')]).toEqual(['math-games', 3, 1, 2]);
  });
});

describe('failedSignIn', () => {
  it('tells wrong details, too many tries and an API out of reach apart', () => {
    expect(failedSignIn(401)).toBe('wrong');
    expect(failedSignIn(429)).toBe('too-many');
    expect(failedSignIn(500)).toBe('offline');
  });
});
