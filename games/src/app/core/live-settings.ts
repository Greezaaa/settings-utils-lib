import { inject, Injectable } from '@angular/core';
import { BackgroundChecks } from './background-checks';
import { FeatureFlags } from './feature-flags';
import { GameAvailability } from './game-availability';
import { SiteNews } from './site-news';

export const RECHECK_MS = 10 * 60_000;
export const MIN_RECHECK_GAP_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class LiveSettings {
  private readonly availability = inject(GameAvailability);
  private readonly flags = inject(FeatureFlags);
  private readonly news = inject(SiteNews);
  private readonly checks = inject(BackgroundChecks);

  start(): void {
    this.checks.add(() => this.recheck(), { everyMs: RECHECK_MS, minGapMs: MIN_RECHECK_GAP_MS });
  }

  private recheck(): void {
    void Promise.all([this.availability.reload(), this.flags.reload(), this.news.reload()]);
  }
}
