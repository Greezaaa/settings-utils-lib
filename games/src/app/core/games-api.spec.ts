import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GamesApi } from './games-api';

function answer(body: unknown, ok = true) {
  return vi.fn(
    async (..._args: Parameters<typeof fetch>) => new Response(JSON.stringify(body), { status: ok ? 200 : 500 }),
  );
}

describe('GamesApi', () => {
  let api: GamesApi;

  beforeEach(() => {
    const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }] });
    api = runInInjectionContext(injector, () => new GamesApi());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps only known games from the play counts', async () => {
    vi.stubGlobal(
      'fetch',
      answer({
        days: 30,
        games: [
          { game: 'math-games', plays: 4 },
          { game: 'chess', plays: 9 },
        ],
      }),
    );
    expect(await api.plays()).toEqual([{ game: 'math-games', plays: 4 }]);
  });

  it('gives empty results when the API fails or is unreachable', async () => {
    vi.stubGlobal('fetch', answer({}, false));
    expect(await api.hiddenWords('es')).toEqual([]);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline');
      }),
    );
    expect(await api.plays()).toEqual([]);
    expect(await api.reportWord('casa', 'es')).toBe(false);
  });

  it('sends JSON to the local API while the site runs on localhost', async () => {
    const fetchMock = answer({});
    vi.stubGlobal('fetch', fetchMock);
    await api.sendFeedback('letter-games', 'up', 'eu', 'fun');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('http://localhost:3000/v1/feedback');
    expect(init?.body).toBe(JSON.stringify({ game: 'letter-games', vote: 'up', language: 'eu', reason: 'fun' }));
  });

  it('reads game switches, keeping known games only', async () => {
    vi.stubGlobal(
      'fetch',
      answer({
        games: [
          { game: 'hit-the-note', enabled: false },
          { game: 'chess', enabled: true },
        ],
      }),
    );
    expect(await api.gameSwitches()).toEqual([{ game: 'hit-the-note', enabled: false }]);
  });
});
