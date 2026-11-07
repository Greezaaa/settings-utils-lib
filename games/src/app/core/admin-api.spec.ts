import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminApi } from './admin-api';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe('AdminApi', () => {
  let api: AdminApi;

  beforeEach(() => {
    const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }] });
    api = runInInjectionContext(injector, () => new AdminApi());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it('tells a right token from a wrong one or an unreachable API, and keeps the right one for this tab', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 401 })),
    );
    expect(await api.signIn('nope')).toBe('wrong');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline');
      }),
    );
    expect(await api.signIn('token')).toBe('offline');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    expect(await api.signIn('token')).toBe('right');
    expect(api.isSignedIn()).toBe(true);
    expect(api.savedToken()).toBe('token');
    api.signOut();
    expect(api.savedToken()).toBeNull();
  });

  it('sends the token with every admin request and keeps only well-formed answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await api.signIn('secret');
    const fetchMock = vi.fn(async (..._args: Parameters<typeof fetch>) =>
      json([
        { word: 'rude', language: 'en', reports: 3, status: 'pending', firstReported: '2026-11-08', decided: null },
        { word: 42 },
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);
    expect(await api.wordReports('pending')).toEqual([
      { word: 'rude', language: 'en', reports: 3, status: 'pending', firstReported: '2026-11-08' },
    ]);
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer secret');
  });

  it('reads feedback with its reasons', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json([{ game: 'math-games', up: 3, down: 1, reasons: { fun: 2 } }])),
    );
    const [feedback] = await api.feedback();
    expect([feedback.game, feedback.up, feedback.down, feedback.reasons.get('fun')]).toEqual(['math-games', 3, 1, 2]);
  });
});
