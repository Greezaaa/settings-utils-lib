import { afterNextRender, DOCUMENT, inject, Injectable, isDevMode } from '@angular/core';
import { field } from './api-url';
import { FeatureFlags } from './feature-flags';
import { SiteNotices } from './site-notices';

const WORKER = 'ngsw-worker.js';

@Injectable({ providedIn: 'root' })
export class OfflineMode {
  private readonly features = inject(FeatureFlags);
  private readonly notices = inject(SiteNotices);
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => void this.start());
  }

  private async start(): Promise<void> {
    if (isDevMode() || !('serviceWorker' in navigator)) {
      return;
    }
    await this.features.ready();
    if (this.features.canUse('offline')) {
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
        if (field(event.data, 'type') === 'VERSION_READY') {
          this.notices.announceUpdate(() => this.document.location.reload());
        }
      });
      await navigator.serviceWorker.register(`/${WORKER}`, { scope: '/' }).catch(() => undefined);
      return;
    }
    const registrations = await navigator.serviceWorker.getRegistrations();
    const ours = registrations.filter((registration) => registration.active?.scriptURL.endsWith(`/${WORKER}`));
    await Promise.all(ours.map((registration) => registration.unregister()));
  }
}
