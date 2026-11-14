import { DOCUMENT, inject, Injectable } from '@angular/core';
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
  private readonly document = inject(DOCUMENT);
  private lastCheck = Date.now();

  start(): void {
    this.document.addEventListener('visibilitychange', () => this.recheckIfVisible());
    this.document.defaultView?.setInterval(() => this.recheckIfVisible(), RECHECK_MS);
  }

  recheckIfVisible(now = Date.now()): void {
    if (this.document.visibilityState !== 'visible' || now - this.lastCheck < MIN_RECHECK_GAP_MS) {
      return;
    }
    this.lastCheck = now;
    void Promise.all([this.availability.refresh(), this.flags.refresh(), this.news.refresh()]);
  }
}
