import { computed, inject, Injectable, signal } from '@angular/core';
import { FeatureId, FEATURES } from './features';
import { GameAvailability } from './game-availability';
import { GamesApi } from './games-api';

@Injectable({ providedIn: 'root' })
export class FeatureFlags {
  private readonly api = inject(GamesApi);
  private readonly availability = inject(GameAvailability);
  private readonly switches = signal<ReadonlyMap<FeatureId, boolean>>(new Map());
  private loading: Promise<void> | null = null;


  readonly openFeatures = computed<readonly FeatureId[]>(() =>
    FEATURES.filter(({ id, openByDefault }) => this.switches().get(id) ?? openByDefault).map(({ id }) => id),
  );

  isOpen(feature: FeatureId): boolean {
    return this.openFeatures().includes(feature);
  }

  canUse(feature: FeatureId): boolean {
    return this.availability.isPreview() || this.isOpen(feature);
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
    const [switches] = await Promise.all([this.api.featureSwitches(), this.availability.ready()]);
    if (switches) {
      this.switches.set(new Map(switches.map(({ feature, enabled }) => [feature, enabled])));
    }
  }
}
