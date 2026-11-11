import { computed, inject, Injectable, signal } from '@angular/core';
import { FeatureId, FEATURES } from './features';
import { GameAvailability } from './game-availability';
import { GamesApi } from './games-api';

/**
 * Which features (like rooms) are open to the public: each has a default in core/features.ts, and the admin switches
 * them from the admin page (stored in the API). Until the switches are known no feature shows, so a closed one never
 * flashes on screen; when the API can't be reached, the defaults apply. In preview mode the admin sees every feature.
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlags {
  private readonly api = inject(GamesApi);
  private readonly availability = inject(GameAvailability);
  private readonly switches = signal<ReadonlyMap<FeatureId, boolean>>(new Map());
  private loading: Promise<void> | null = null;

  readonly isKnown = signal(false);

  readonly openFeatures = computed<readonly FeatureId[]>(() =>
    FEATURES.filter(({ id, openByDefault }) => this.switches().get(id) ?? openByDefault).map(({ id }) => id),
  );

  isOpen(feature: FeatureId): boolean {
    return this.openFeatures().includes(feature);
  }

  /** Whether this visitor can use a feature: open to the public, or the admin's preview */
  canUse(feature: FeatureId): boolean {
    return this.isKnown() && (this.availability.isPreview() || this.isOpen(feature));
  }

  /** Resolves once the switches are known (or the API gave up); browser only */
  ready(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  /** Reads the switches again, e.g. after the admin changed one */
  async refresh(): Promise<void> {
    this.loading = this.load();
    await this.loading;
  }

  private async load(): Promise<void> {
    // Preview mode comes with the games' switches: both are asked at once, and the flags count once both are known
    const [switches] = await Promise.all([this.api.featureSwitches(), this.availability.ready()]);
    // Without an answer the switches known so far stay (the defaults on a first load)
    if (switches) {
      this.switches.set(new Map(switches.map(({ feature, enabled }) => [feature, enabled])));
    }
    this.isKnown.set(true);
  }
}
