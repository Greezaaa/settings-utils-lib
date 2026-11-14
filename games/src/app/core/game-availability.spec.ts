import { DOCUMENT, Injector, runInInjectionContext, signal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminApi, AdminRole, canPreview } from './admin-api';
import { GameAvailability } from './game-availability';
import { GAMES } from './games';
import { GameCategoryList, GamesApi, GameSwitch, ThumbnailVersion } from './games-api';

function adminAs(role?: AdminRole): Pick<AdminApi, 'restore' | 'canPreview'> {
  return {
    restore: vi.fn(async () => (role ? 'signed-in' : 'signed-out')),
    canPreview: signal(canPreview(role)).asReadonly(),
  };
}

function availabilityWith(
  switches: GameSwitch[] | null,
  role?: AdminRole,
  categories: GameCategoryList[] = [],
  thumbnails: ThumbnailVersion[] = [],
): GameAvailability {
  const api: Pick<GamesApi, 'gameSettings'> = {
    gameSettings: vi.fn(async () => (switches ? { switches, categories, thumbnails } : null)),
  };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: document },
      { provide: GamesApi, useValue: api },
      { provide: AdminApi, useValue: adminAs(role) },
    ],
  });
  return runInInjectionContext(injector, () => new GameAvailability());
}

describe('GameAvailability', () => {
  afterEach(() => localStorage.clear());

  it('shows an uploaded thumbnail, with its version so a new upload replaces the old one, and the automatic one otherwise', async () => {
    const availability = availabilityWith([], undefined, [], [{ game: 'word-search', version: 1700 }]);
    await availability.ready();
    expect(availability.thumbnailOf('word-search')).toBe('http://localhost:3000/v1/games/word-search/thumbnail?v=1700');
    expect(availability.thumbnailOf('math-games')).toBe('/thumbnails/math-games.webp');
    availability.setThumbnail('math-games', 1800);
    expect(availability.thumbnailOf('math-games')).toBe('http://localhost:3000/v1/games/math-games/thumbnail?v=1800');
    availability.setThumbnail('math-games', null);
    expect(availability.thumbnailOf('math-games')).toBe('/thumbnails/math-games.webp');
  });

  it('uses the admin\'s categories over the built-in one, and remembers them for offline visits', async () => {
    const online = availabilityWith([], undefined, [{ game: 'letter-sudoku', categories: ['letters', 'puzzles'] }]);
    expect(online.categoriesOf('letter-sudoku')).toEqual(['letters']);
    await online.ready();
    expect(online.categoriesOf('letter-sudoku')).toEqual(['letters', 'puzzles']);
    expect(online.categoriesOf('math-games')).toEqual(['numbers']);
    const offline = availabilityWith(null);
    await offline.ready();
    expect(offline.categoriesOf('letter-sudoku')).toEqual(['letters', 'puzzles']);
  });

  it('opens the games open by default until the admin switches them', async () => {
    const availability = availabilityWith([{ game: 'sliding-puzzle', enabled: false }]);
    expect(availability.canPlay('sliding-puzzle')).toBe(true);
    expect(availability.canPlay('how-many')).toBe(false);
    await availability.ready();
    expect(availability.canPlay('math-games')).toBe(true);
    expect(availability.isOpen('sliding-puzzle')).toBe(false);
    expect(availability.canPlay('sliding-puzzle')).toBe(false);
    expect(availability.visibleGames()).toHaveLength(GAMES.filter((game) => game.openByDefault).length - 1);
  });

  it('falls back to the defaults when the API gives no switches', async () => {
    const availability = availabilityWith(null);
    await availability.ready();
    expect(availability.visibleGames()).toEqual(GAMES.filter((game) => game.openByDefault).map(({ slug }) => slug));
  });

  it('shows every game in preview to testers, and remembers it for them', async () => {
    const availability = availabilityWith([{ game: 'sliding-puzzle', enabled: false }], 'tester');
    await availability.ready();
    availability.setPreview(true);
    expect(availability.canPlay('sliding-puzzle')).toBe(true);
    expect(availability.isOpen('sliding-puzzle')).toBe(false);

    const later = availabilityWith([], 'tester');
    await later.ready();
    expect(later.isPreview()).toBe(true);
  });

  it('turns preview off for anyone else, even with the flag set in the browser', async () => {
    availabilityWith([], 'tester').setPreview(true);
    const moderator = availabilityWith([], 'moderator');
    await moderator.ready();
    expect(moderator.isPreview()).toBe(false);

    availabilityWith([], 'super').setPreview(true);
    const signedOut = availabilityWith([]);
    await signedOut.ready();
    expect(signedOut.isPreview()).toBe(false);
  });
});
