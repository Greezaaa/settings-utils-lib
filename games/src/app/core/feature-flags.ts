import { computed, inject, Injectable } from '@angular/core';
import { Connection } from './connection';
import { FeatureId, FEATURES } from './features';
import { GameAvailability } from './game-availability';
import { GamesApi, isFeatureId } from './games-api';
import { RememberedSwitches } from './remembered-switches';

const SWITCHES_STORAGE = 'feature-switches';
const NEEDS_CONNECTION: ReadonlySet<FeatureId> = new Set(
  FEATURES.filter(({ needsConnection }) => needsConnection).map(({ id }) => id),
);

@Injectable({ providedIn: 'root' })
export class FeatureFlags {
  private readonly api = inject(GamesApi);
  private readonly availability = inject(GameAvailability);
  private readonly connection = inject(Connection);
  private readonly switches = new RememberedSwitches<FeatureId>(SWITCHES_STORAGE, isFeatureId);
  private loading: Promise<void> | null = null;

  readonly openFeatures = computed<readonly FeatureId[]>(() =>
    FEATURES.filter(({ id, openByDefault }) => this.switches.all().get(id) ?? openByDefault).map(({ id }) => id),
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
    const loading = this.whenLoaded();
    if (this.switches.wasStored && this.canUse(feature)) {
      return true;
    }
    await loading;
    return this.canUse(feature);
  }

  whenLoaded(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  setOpen(feature: FeatureId, open: boolean): void {
    this.switches.set(feature, open);
  }

  async reload(): Promise<void> {
    this.loading = this.load();
    await this.loading;
  }

  private async load(): Promise<void> {
    this.switches.restore();
    const [site] = await Promise.all([this.api.site(), this.availability.whenLoaded()]);
    const switches = site?.features;
    if (switches) {
      this.switches.replace(new Map(switches.map(({ feature, enabled }) => [feature, enabled])));
    }
  }
}
