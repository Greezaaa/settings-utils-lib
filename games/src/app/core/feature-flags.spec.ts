import { DOCUMENT, Injector, runInInjectionContext, signal } from '@angular/core';
import { AdminApi } from './admin-api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureFlags } from './feature-flags';
import { GameAvailability } from './game-availability';
import { FeatureSwitch, GamesApi, GameSwitch } from './games-api';

function flagsWith(features: FeatureSwitch[]): { flags: FeatureFlags; availability: GameAvailability } {
  const api: Pick<GamesApi, 'featureSwitches' | 'gameSwitches'> = {
    featureSwitches: vi.fn(async () => features),
    gameSwitches: vi.fn(async (): Promise<GameSwitch[] | null> => []),
  };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: document },
      { provide: GamesApi, useValue: api },
      {
        provide: AdminApi,
        useValue: { restore: vi.fn(async () => 'signed-in'), canPreview: signal(true).asReadonly() },
      },
      { provide: GameAvailability, useFactory: () => new GameAvailability(), deps: [] },
    ],
  });
  return runInInjectionContext(injector, () => {
    const availability = injector.get(GameAvailability);
    return { flags: new FeatureFlags(), availability };
  });
}

describe('FeatureFlags', () => {
  afterEach(() => localStorage.clear());

  it('shows the defaults until the switches arrive, then the admin\'s choice', async () => {
    const closed = flagsWith([{ feature: 'rooms', enabled: false }]);
    expect(closed.flags.canUse('rooms')).toBe(true);
    await closed.flags.ready();
    expect(closed.flags.canUse('rooms')).toBe(false);
  });

  it('lets testers and the super admin use closed features in preview', async () => {
    const { flags, availability } = flagsWith([{ feature: 'rooms', enabled: false }]);
    await flags.ready();
    availability.setPreview(true);
    expect(flags.canUse('rooms')).toBe(true);
    expect(flags.isOpen('rooms')).toBe(false);
  });

  it('keeps a game in rooms apart from rooms themselves', async () => {
    const { flags } = flagsWith([{ feature: 'rooms-math-games', enabled: false }]);
    await flags.ready();
    expect(flags.canUse('rooms')).toBe(true);
    expect(flags.canUse('rooms-math-games')).toBe(false);
  });
});
