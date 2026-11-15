import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, isDevMode, signal, untracked } from '@angular/core';
import { field } from './api-url';
import { FeatureFlags } from './feature-flags';
import { SiteNotices } from './site-notices';
import { readStored, writeStored } from './site-storage';
import { removeWorker } from './worker-update';

const STORAGE = 'offline-play';
const WORKER = 'ngsw-worker.js';

export type OfflineChoice = 'on' | 'off';
export const OFFLINE_CHOICES: readonly OfflineChoice[] = ['on', 'off'];

export interface OfflineStatus {
  readonly isActive: boolean;
  readonly storedBytes: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineMode {
  private readonly features = inject(FeatureFlags);
  private readonly notices = inject(SiteNotices);
  private readonly document = inject(DOCUMENT);
  private readonly chosen = signal<OfflineChoice>('off');

  readonly isAvailable = computed(() => this.features.canUse('offline'));
  readonly choice = this.chosen.asReadonly();
  readonly isOn = computed(() => this.isAvailable() && this.chosen() === 'on');

  constructor() {
    const isReady = signal(false);
    afterNextRender(async () => {
      if (!this.canUseWorker()) {
        return;
      }
      if (readStored(STORAGE) === 'on' || (await this.isInstalled())) {
        this.chosen.set('on');
      }
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
        if (field(event.data, 'type') === 'VERSION_READY') {
          this.notices.announceUpdate(() => this.document.location.reload());
        }
      });
      await this.features.whenLoaded();
      isReady.set(true);
    });
    effect(() => {
      if (!isReady()) {
        return;
      }
      const isOn = this.isOn();
      const isTurnedOff = this.chosen() === 'off' || (this.features.hasServerAnswer() && !this.isAvailable());
      untracked(() => void (isOn ? this.install() : isTurnedOff ? this.remove() : undefined));
    });
  }

  set(choice: OfflineChoice): void {
    this.chosen.set(choice);
    writeStored(STORAGE, choice);
  }

  async status(): Promise<OfflineStatus> {
    if (!this.canUseWorker()) {
      return { isActive: false, storedBytes: 0 };
    }
    const estimate = await navigator.storage?.estimate().catch(() => null);
    return { isActive: navigator.serviceWorker.controller !== null, storedBytes: estimate?.usage ?? 0 };
  }

  private canUseWorker(): boolean {
    return !isDevMode() && 'serviceWorker' in navigator;
  }

  private async isInstalled(): Promise<boolean> {
    return (await this.ownRegistrations()).length > 0;
  }

  private async ownRegistrations(): Promise<readonly ServiceWorkerRegistration[]> {
    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    return registrations.filter((registration) => registration.active?.scriptURL.endsWith(`/${WORKER}`));
  }

  private async install(): Promise<void> {
    await navigator.serviceWorker.register(`/${WORKER}`, { scope: '/' }).catch(() => undefined);
  }

  private async remove(): Promise<void> {
    await removeWorker(navigator.serviceWorker, caches);
  }
}
