import { afterNextRender, computed, DOCUMENT, effect, inject, Injectable, isDevMode, signal, untracked } from '@angular/core';
import { field } from './api-url';
import { FeatureFlags } from './feature-flags';
import { SiteNotices } from './site-notices';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'offline-play';
const WORKER = 'ngsw-worker.js';
const WORKER_CACHES = 'ngsw:';

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
      if (readStored(STORAGE) === 'on') {
        this.chosen.set('on');
      }
      if (!this.canUseWorker()) {
        return;
      }
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
        if (field(event.data, 'type') === 'VERSION_READY') {
          this.notices.announceUpdate(() => this.document.location.reload());
        }
      });
      await this.features.ready();
      isReady.set(true);
    });
    effect(() => {
      if (isReady()) {
        const isOn = this.isOn();
        untracked(() => void (isOn ? this.install() : this.remove()));
      }
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

  private async install(): Promise<void> {
    await navigator.serviceWorker.register(`/${WORKER}`, { scope: '/' }).catch(() => undefined);
  }

  private async remove(): Promise<void> {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const ours = registrations.filter((registration) => registration.active?.scriptURL.endsWith(`/${WORKER}`));
    await Promise.all(ours.map((registration) => registration.unregister()));
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith(WORKER_CACHES)).map((name) => caches.delete(name)));
  }
}
