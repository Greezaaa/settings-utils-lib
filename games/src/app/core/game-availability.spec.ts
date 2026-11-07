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
    expect(availability.isOpen('hit-the-note')).toBe(true);
    await availability.ready();
    expect(availability.isOpen('hit-the-note')).toBe(false);
    expect(availability.canPlay('hit-the-note')).toBe(false);
    expect(availability.visibleGames()).toHaveLength(GAMES.length - 1);
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
