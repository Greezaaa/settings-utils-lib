import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureFlags } from './feature-flags';
import { GameAvailability } from './game-availability';
import { LiveSettings, MIN_RECHECK_GAP_MS } from './live-settings';
import { SiteNews } from './site-news';

function liveSettings(visibility: DocumentVisibilityState) {
  const refreshes = { games: vi.fn(async () => undefined), features: vi.fn(async () => undefined), news: vi.fn(async () => undefined) };
  const page: Pick<Document, 'visibilityState' | 'addEventListener' | 'defaultView'> = {
    visibilityState: visibility,
    addEventListener: vi.fn(),
    defaultView: null,
  };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: page },
      { provide: GameAvailability, useValue: { refresh: refreshes.games } },
      { provide: FeatureFlags, useValue: { refresh: refreshes.features } },
      { provide: SiteNews, useValue: { refresh: refreshes.news } },
    ],
  });
  return { live: runInInjectionContext(injector, () => new LiveSettings()), refreshes };
}

describe('LiveSettings', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rechecks games, features and news when the tab is visible, at most once a minute', () => {
    const { live, refreshes } = liveSettings('visible');
    const start = Date.now();
    live.recheckIfVisible(start + 1000);
    expect(refreshes.games).not.toHaveBeenCalled();
    live.recheckIfVisible(start + MIN_RECHECK_GAP_MS + 1);
    expect([refreshes.games, refreshes.features, refreshes.news].map((refresh) => refresh.mock.calls.length)).toEqual([1, 1, 1]);
    live.recheckIfVisible(start + MIN_RECHECK_GAP_MS + 2);
    expect(refreshes.games).toHaveBeenCalledTimes(1);
  });

  it('never rechecks while the tab is hidden', () => {
    const { live, refreshes } = liveSettings('hidden');
    live.recheckIfVisible(Date.now() + MIN_RECHECK_GAP_MS * 5);
    expect(refreshes.games).not.toHaveBeenCalled();
  });
});
