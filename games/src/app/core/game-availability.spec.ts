import { DOCUMENT, Injector, runInInjectionContext, signal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminApi, AdminRole, canPreview } from './admin-api';
import { GameAvailability } from './game-availability';
import { GAMES } from './games';
import { GamesApi, GameSwitch } from './games-api';

/** An admin API whose session belongs to `role` (signed out when undefined) */
function adminAs(role?: AdminRole): Pick<AdminApi, 'restore' | 'canPreview'> {
  return {
    restore: vi.fn(async () => (role ? 'signed-in' : 'signed-out')),
    canPreview: signal(canPreview(role)).asReadonly(),
  };
}

/** The availability service with an API answering `switches`, for a visitor signed in as `role` */
function availabilityWith(switches: GameSwitch[], role?: AdminRole): GameAvailability {
  const api: Pick<GamesApi, 'gameSwitches'> = { gameSwitches: vi.fn(async () => switches) };
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

  it('shows every game in preview to testers, and remembers it for them', async () => {
    const availability = availabilityWith([{ game: 'hit-the-note', enabled: false }], 'tester');
    await availability.ready();
    availability.setPreview(true);
    expect(availability.canPlay('hit-the-note')).toBe(true);
    expect(availability.isOpen('hit-the-note')).toBe(false);

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
