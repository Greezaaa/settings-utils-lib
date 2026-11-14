import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GamesApi, parseNewsItem } from './games-api';
import { readOutbox } from './outbox';

function answer(body: unknown, ok = true, status = ok ? 200 : 500) {
  return vi.fn(async (..._args: Parameters<typeof fetch>) => new Response(JSON.stringify(body), { status }));
}

describe('GamesApi', () => {
  let api: GamesApi;

  beforeEach(() => {
    const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }] });
    api = runInInjectionContext(injector, () => new GamesApi());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
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
  });

  it('keeps reports that cannot reach the API (or hit a server error) for later, and drops the ones it refuses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('offline');
      }),
    );
    expect(await api.reportWord('casa', 'es')).toBe(true);
    expect(readOutbox()).toEqual([{ path: '/v1/word-reports', body: { word: 'casa', language: 'es' } }]);
    vi.stubGlobal('fetch', answer({}, false, 504));
    expect(await api.reportWord('gato', 'es')).toBe(true);
    expect(readOutbox()).toHaveLength(2);
    vi.stubGlobal('fetch', answer({}, false, 400));
    expect(await api.reportWord('perro', 'es')).toBe(false);
    expect(readOutbox()).toHaveLength(2);
  });

  it('sends JSON to the local API while the site runs on localhost', async () => {
    const fetchMock = answer({});
    vi.stubGlobal('fetch', fetchMock);
    await api.sendFeedback('letter-games', 'up', 'eu', 'fun');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe('http://localhost:3000/v1/feedback');
    expect(init?.body).toBe(JSON.stringify({ game: 'letter-games', vote: 'up', language: 'eu', reason: 'fun' }));
  });

  it('reads news, showing the Spanish text in languages left empty and ignoring unknown games', () => {
    const [item] = parseNewsItem({
      version: 16,
      published: '2026-11-20T11:00:00.000Z',
      kind: 'game',
      game: 'chess',
      feature: 'offline',
      privacy: true,
      text: { es: 'Nuevo juego', en: 'New game', eu: '  ' },
    });
    expect(item).toEqual({
      version: 16,
      published: '2026-11-20T11:00:00.000Z',
      privacy: true,
      change: {
        kind: 'game',
        feature: 'offline',
        text: { es: 'Nuevo juego', en: 'New game', eu: 'Nuevo juego', it: 'Nuevo juego', uk: 'Nuevo juego' },
      },
    });
    expect(parseNewsItem({ version: 1, published: 'x', kind: 'gossip', text: { es: 'Hola' } })).toEqual([]);
  });

  it('reads game switches and categories, keeping known games and categories only', async () => {
    vi.stubGlobal(
      'fetch',
      answer({
        games: [
          { game: 'hit-the-note', enabled: false },
          { game: 'chess', enabled: true },
        ],
        categories: [
          { game: 'letter-sudoku', categories: ['letters', 'sports', 'puzzles'] },
          { game: 'word-search', categories: ['sports'] },
          { game: 'chess', categories: ['puzzles'] },
        ],
      }),
    );
    expect(await api.gameSettings()).toEqual({
      switches: [{ game: 'hit-the-note', enabled: false }],
      categories: [{ game: 'letter-sudoku', categories: ['letters', 'puzzles'] }],
      thumbnails: [],
    });
  });
});
