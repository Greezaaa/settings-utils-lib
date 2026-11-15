import { DOCUMENT, Injector, runInInjectionContext, signal } from '@angular/core';
import { AdminApi } from './admin-api';
import { Connection } from './connection';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FeatureFlags } from './feature-flags';
import { GameAvailability } from './game-availability';
import { FeatureSwitch, GameSettings, GamesApi } from './games-api';

const online = signal(true);

function flagsWith(features: FeatureSwitch[] | null): { flags: FeatureFlags; availability: GameAvailability } {
  return flagsFrom({
    featureSwitches: vi.fn(async () => features),
    gameSettings: vi.fn(async (): Promise<GameSettings | null> => ({ switches: [], categories: [], thumbnails: [] })),
  });
}

function flagsFrom(api: Pick<GamesApi, 'featureSwitches' | 'gameSettings'>): { flags: FeatureFlags; availability: GameAvailability } {
  const connection: Pick<Connection, 'isOnline'> = { isOnline: online.asReadonly() };
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: document },
      { provide: GamesApi, useValue: api },
      { provide: Connection, useValue: connection },
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
  afterEach(() => {
    localStorage.clear();
    online.set(true);
  });

  it('lets a page open at once when the last visit saved its feature on, without waiting for the API', async () => {
    await flagsWith([{ feature: 'rooms', enabled: true }]).flags.ready();
    const { flags } = flagsFrom({ featureSwitches: () => new Promise(() => undefined), gameSettings: () => new Promise(() => undefined) });
    await expect(flags.canEnter('rooms')).resolves.toBe(true);
  });

  it('asks the API before opening a page on the first visit', async () => {
    const { flags } = flagsWith([{ feature: 'rooms', enabled: false }]);
    await expect(flags.canEnter('rooms')).resolves.toBe(false);
  });

  it('turns rooms off without a connection, and keeps features that work offline', async () => {
    const { flags } = flagsWith([]);
    await flags.ready();
    online.set(false);
    expect(flags.canUse('rooms')).toBe(false);
    expect(flags.canUse('rooms-math-games')).toBe(false);
    expect(flags.canUse('answer-words')).toBe(true);
    online.set(true);
    expect(flags.canUse('rooms')).toBe(true);
  });

  it('keeps the last known switches when the API cannot be reached', async () => {
    await flagsWith([{ feature: 'offline', enabled: true }]).flags.ready();
    const { flags } = flagsWith(null);
    await flags.ready();
    expect(flags.isOpen('offline')).toBe(true);
  });

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
