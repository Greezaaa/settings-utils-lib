import { Injector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GamesApi, SiteConfig } from './games-api';
import { SiteNews } from './site-news';
import { NewsItem } from './site-updates';

const ITEM: NewsItem = {
  version: 1,
  published: '2026-11-01T10:00:00.000Z',
  privacy: false,
  change: {
    kind: 'game',
    game: 'word-search',
    text: { en: 'Word search', es: 'Sopa de letras', eu: 'Hitz bilaketa', it: 'Cerca parole', uk: 'Пошук слів' },
  },
};

function newsWith(newsVersion: string): { news: SiteNews; api: Pick<GamesApi, 'site' | 'news'> } {
  const site: SiteConfig = { games: { switches: [], categories: [], thumbnails: [] }, features: [], newsVersion };
  const api: Pick<GamesApi, 'site' | 'news'> = { site: vi.fn(async () => site), news: vi.fn(async () => [ITEM]) };
  const injector = Injector.create({ providers: [{ provide: GamesApi, useValue: api }] });
  return { news: runInInjectionContext(injector, () => new SiteNews()), api };
}

describe('SiteNews', () => {
  afterEach(() => localStorage.clear());

  it('downloads the news only when their version changed since the last visit', async () => {
    const first = newsWith('a');
    await first.news.whenLoaded();
    expect(first.api.news).toHaveBeenCalledTimes(1);
    const same = newsWith('a');
    await same.news.whenLoaded();
    expect(same.api.news).not.toHaveBeenCalled();
    expect(same.news.latestVersion()).toBe(1);
    const changed = newsWith('b');
    await changed.news.whenLoaded();
    expect(changed.api.news).toHaveBeenCalledTimes(1);
  });
});
