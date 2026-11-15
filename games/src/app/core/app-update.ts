import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, isDevMode, signal, untracked } from '@angular/core';
import { field } from './api-url';
import { BackgroundChecks } from './background-checks';
import { FeatureFlags } from './feature-flags';
import { SiteNotices } from './site-notices';
import { activateWorkerUpdate, checkWorkerUpdate, removeWorker } from './worker-update';

declare const GAMES_VERSION: string | undefined;

const VERSION_FILE = '/version.json';
const CHECK_EVERY_MS = 30 * 60 * 1000;
const MIN_CHECK_GAP_MS = 60_000;
const CHECK_FOR_UPDATES = 'CHECK_FOR_UPDATES';
const TRIED_STORAGE = 'su-labs-games:update-tried';

export type UpdateState = 'idle' | 'checking' | 'latest' | 'ready' | 'failed';

interface ServedVersion {
  readonly version: string;
  readonly isCritical: boolean;
}

/**
 * Compares the running build's version (set by `npm run build:games`) with `/version.json` on the server: on start,
 * when the app comes back to the screen (phones keep installed apps open for days) and every half hour, plus the
 * button in the settings. A newer version shows the reload notice once; `critical` in the file (set with
 * `GAMES_CRITICAL=1 npm run build:games`) marks it as one that fixes or changes how the games work.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdate {
  private readonly document = inject(DOCUMENT);
  private readonly features = inject(FeatureFlags);
  private readonly notices = inject(SiteNotices);
  private readonly checks = inject(BackgroundChecks);
  private readonly stateSignal = signal<UpdateState>('idle');
  private readonly latestSignal = signal<string | null>(null);
  private readonly criticalSignal = signal(false);

  readonly current = typeof GAMES_VERSION === 'string' ? GAMES_VERSION : 'dev';
  readonly isAvailable = computed(() => this.features.canUse('update-check'));
  readonly state = this.stateSignal.asReadonly();
  readonly latest = this.latestSignal.asReadonly();
  readonly isCritical = this.criticalSignal.asReadonly();

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
    const served = await this.fetchLatest();
    if (served === null) {
      this.stateSignal.set('failed');
      return;
    }
    this.latestSignal.set(served.version);
    this.criticalSignal.set(served.isCritical);
    if (served.version === this.current) {
      this.stateSignal.set('latest');
      return;
    }
    this.stateSignal.set('ready');
    this.notices.announceUpdate(() => this.reload());
  }

  async reload(): Promise<void> {
    const view = this.document.defaultView;
    const container = view?.navigator.serviceWorker;
    if (view && container?.controller) {
      this.stateSignal.set('checking');
      const latest = this.latestSignal() ?? '';
      const isRetry = this.readTried(view) === latest;
      this.writeTried(view, latest);
      const answer = isRetry ? 'failed' : await checkWorkerUpdate(container);
      const isActivated = answer !== 'failed' && (await activateWorkerUpdate(container));
      if (!isActivated) {
        await removeWorker(container, view.caches);
      }
    }
    this.document.location.reload();
  }

  private readTried(view: Window): string | null {
    try {
      return view.sessionStorage.getItem(TRIED_STORAGE);
    } catch {
      return null;
    }
  }

  private writeTried(view: Window, version: string): void {
    try {
      view.sessionStorage.setItem(TRIED_STORAGE, version);
    } catch {}
  }

  private async fetchLatest(): Promise<ServedVersion | null> {
    try {
      const response = await fetch(VERSION_FILE, { cache: 'no-store' });
      const body: unknown = response.ok ? await response.json() : null;
      const version = field(body, 'version');
      return typeof version === 'string' ? { version, isCritical: field(body, 'critical') === true } : null;
    } catch {
      return null;
    }
  }
}
