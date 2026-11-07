import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameAvailability } from './game-availability';
import { GAMES } from './games';
import { GamesApi, GameSwitch } from './games-api';

/** The availability service with an API answering `switches` */
function availabilityWith(switches: GameSwitch[]): GameAvailability {
  const api: Pick<GamesApi, 'gameSwitches'> = { gameSwitches: vi.fn(async () => switches) };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: document },
      { provide: GamesApi, useValue: api },
    ],
  });
  return runInInjectionContext(injector, () => new GameAvailability());
}

describe('GameAvailability', () => {
  afterEach(() => localStorage.clear());

  it('opens the games open by default until the admin switches them', async () => {
    const availability = availabilityWith([{ game: 'hit-the-note', enabled: false }]);
    // Nothing shows until the switches are known, so a closed game never flashes on screen
    expect(availability.visibleGames()).toEqual([]);
    expect(availability.canPlay('math-games')).toBe(false);
    await availability.ready();
    expect(availability.canPlay('math-games')).toBe(true);
    expect(availability.isOpen('hit-the-note')).toBe(false);
    expect(availability.canPlay('hit-the-note')).toBe(false);
    expect(availability.visibleGames()).toHaveLength(GAMES.length - 1);
  });

  it('falls back to the defaults when the API gives no switches', async () => {
    const availability = availabilityWith([]);
    await availability.ready();
    expect(availability.visibleGames()).toEqual(GAMES.filter((game) => game.openByDefault).map(({ slug }) => slug));
  });

  it('shows every game in preview, and remembers preview', async () => {
    const availability = availabilityWith([{ game: 'hit-the-note', enabled: false }]);
    await availability.ready();
    availability.setPreview(true);
    expect(availability.canPlay('hit-the-note')).toBe(true);
    expect(availability.isOpen('hit-the-note')).toBe(false);

    const later = availabilityWith([]);
    await later.ready();
    expect(later.isPreview()).toBe(true);
  });
});
