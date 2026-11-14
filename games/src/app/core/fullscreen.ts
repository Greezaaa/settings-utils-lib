import { afterNextRender, DOCUMENT, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Fullscreen {
  private readonly document = inject(DOCUMENT);
  private readonly supported = signal(false);
  private readonly on = signal(false);

  readonly isSupported = this.supported.asReadonly();
  readonly isOn = this.on.asReadonly();

  constructor() {
    afterNextRender(() => {
      this.supported.set(this.document.fullscreenEnabled === true);
      this.document.addEventListener('fullscreenchange', () => this.on.set(this.document.fullscreenElement !== null));
    });
  }

  async toggle(): Promise<void> {
    if (this.document.fullscreenElement) {
      await this.document.exitFullscreen().catch(() => undefined);
    } else {
      await this.document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
    }
  }
}
