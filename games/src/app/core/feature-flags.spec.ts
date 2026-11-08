import { DOCUMENT, Injector, runInInjectionContext, signal } from '@angular/core';
import { AdminApi } from './admin-api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureFlags } from './feature-flags';
import { GameAvailability } from './game-availability';
import { FeatureSwitch, GamesApi, GameSwitch } from './games-api';

/** The flags service with an API answering `features` */
function flagsWith(features: FeatureSwitch[]): { flags: FeatureFlags; availability: GameAvailability } {
  const api: Pick<GamesApi, 'featureSwitches' | 'gameSwitches'> = {
    featureSwitches: vi.fn(async () => features),
    gameSwitches: vi.fn(async (): Promise<GameSwitch[]> => []),
  };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: document },
      { provide: GamesApi, useValue: api },
      // A signed-in tester, who may use preview
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

  it('keeps new features closed until the admin opens them, and hides everything until known', async () => {
    const closed = flagsWith([]);
    expect(closed.flags.canUse('rooms')).toBe(false);
    await closed.flags.ready();
    expect(closed.flags.canUse('rooms')).toBe(false);

    const opened = flagsWith([{ feature: 'rooms', enabled: true }]);
    await opened.flags.ready();
    expect(opened.flags.canUse('rooms')).toBe(true);
  });

  it('lets testers and the super admin use closed features in preview', async () => {
    const { flags, availability } = flagsWith([]);
    await flags.ready();
    availability.setPreview(true);
    expect(flags.canUse('rooms')).toBe(true);
    expect(flags.isOpen('rooms')).toBe(false);
  });
});
