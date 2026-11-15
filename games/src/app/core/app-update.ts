import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, isDevMode, signal, untracked } from '@angular/core';
import { field } from './api-url';
import { BackgroundChecks } from './background-checks';
import { FeatureFlags } from './feature-flags';
import { SiteNotices } from './site-notices';

declare const GAMES_VERSION: string | undefined;

const VERSION_FILE = '/version.json';
const CHECK_EVERY_MS = 30 * 60 * 1000;
const MIN_CHECK_GAP_MS = 60_000;
const CHECK_FOR_UPDATES = 'CHECK_FOR_UPDATES';

export type UpdateState = 'idle' | 'checking' | 'latest' | 'ready' | 'failed';

/**
 * Compares the running build's version (set by `npm run build:games`) with `/version.json` on the server: on start,
 * when the app comes back to the screen (phones keep installed apps open for days) and every half hour, plus the
 * button in the settings. A newer version shows the reload notice once.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdate {
  private readonly document = inject(DOCUMENT);
  private readonly features = inject(FeatureFlags);
  private readonly notices = inject(SiteNotices);
  private readonly checks = inject(BackgroundChecks);
  private readonly stateSignal = signal<UpdateState>('idle');
  private readonly latestSignal = signal<string | null>(null);

  readonly current = typeof GAMES_VERSION === 'string' ? GAMES_VERSION : 'dev';
  readonly isAvailable = computed(() => this.features.canUse('update-check'));
  readonly state = this.stateSignal.asReadonly();
  readonly latest = this.latestSignal.asReadonly();

  constructor() {
    const isReady = signal(false);
    afterNextRender(() => isReady.set(true));
    effect((onCleanup) => {
      if (!isReady() || !this.isAvailable() || isDevMode()) {
        return;
      }
      untracked(() => void this.check());
      onCleanup(this.checks.add(() => void this.check(), { everyMs: CHECK_EVERY_MS, minGapMs: MIN_CHECK_GAP_MS }));
    });
  }

  async check(): Promise<void> {
    if (this.stateSignal() === 'checking') {
      return;
    }
    this.stateSignal.set('checking');
    this.document.defaultView?.navigator.serviceWorker?.controller?.postMessage({
      action: CHECK_FOR_UPDATES,
      nonce: Date.now(),
    });
    const latest = await this.fetchLatest();
    if (latest === null) {
      this.stateSignal.set('failed');
      return;
    }
    this.latestSignal.set(latest);
    if (latest === this.current) {
      this.stateSignal.set('latest');
      return;
    }
    this.stateSignal.set('ready');
    this.notices.announceUpdate(() => this.reload());
  }

  reload(): void {
    this.document.location.reload();
  }

  private async fetchLatest(): Promise<string | null> {
    try {
      const response = await fetch(VERSION_FILE, { cache: 'no-store' });
      const version = response.ok ? field(await response.json(), 'version') : null;
      return typeof version === 'string' ? version : null;
    } catch {
      return null;
    }
  }
}
