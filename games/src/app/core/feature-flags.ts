import { computed, inject, Injectable, signal } from '@angular/core';
import { Connection } from './connection';
import { FeatureId, FEATURES } from './features';
import { GameAvailability } from './game-availability';
import { GamesApi, isFeatureId } from './games-api';
import { readSwitches, writeSwitches } from './remembered-switches';

const SWITCHES_STORAGE = 'feature-switches';
const NEEDS_CONNECTION: ReadonlySet<FeatureId> = new Set(
  FEATURES.filter(({ needsConnection }) => needsConnection).map(({ id }) => id),
);

@Injectable({ providedIn: 'root' })
export class FeatureFlags {
  private readonly api = inject(GamesApi);
  private readonly availability = inject(GameAvailability);
  private readonly connection = inject(Connection);
  private readonly switches = signal<ReadonlyMap<FeatureId, boolean>>(new Map());
  private loading: Promise<void> | null = null;
  private hasRemembered = false;
  private hasStoredSwitches = false;

  readonly openFeatures = computed<readonly FeatureId[]>(() =>
    FEATURES.filter(({ id, openByDefault }) => this.switches().get(id) ?? openByDefault).map(({ id }) => id),
  );

  isOpen(feature: FeatureId): boolean {
    return this.openFeatures().includes(feature);
  }

  canUse(feature: FeatureId): boolean {
    if (NEEDS_CONNECTION.has(feature) && !this.connection.isOnline()) {
      return false;
    }
    return this.availability.isPreview() || this.isOpen(feature);
  }

  async canEnter(feature: FeatureId): Promise<boolean> {
    const loading = this.ready();
    if (this.hasStoredSwitches && this.canUse(feature)) {
      return true;
    }
    await loading;
    return this.canUse(feature);
  }

  ready(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  setOpen(feature: FeatureId, open: boolean): void {
    this.switches.update((switches) => new Map(switches).set(feature, open));
  }

  async refresh(): Promise<void> {
    this.loading = this.load();
    await this.loading;
  }

  private async load(): Promise<void> {
    if (!this.hasRemembered) {
      this.hasRemembered = true;
      const stored = readSwitches(SWITCHES_STORAGE, isFeatureId);
      this.hasStoredSwitches = stored !== null;
      this.switches.set(stored ?? this.switches());
    }
    const [site] = await Promise.all([this.api.site(), this.availability.ready()]);
    const switches = site?.features;
    if (switches) {
      const known = new Map(switches.map(({ feature, enabled }) => [feature, enabled]));
      this.switches.set(known);
      writeSwitches(SWITCHES_STORAGE, known);
    }
  }
}
