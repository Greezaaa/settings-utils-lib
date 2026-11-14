import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { SHARED_SETTINGS } from './shared-settings';

/**
 * The visitor's choice to calm the site's motion, shared with games.su-labs.dev like the theme. While it's on, the
 * page carries `data-reduce-motion` and the stylesheet stops every animation and transition; the system's own
 * "reduce motion" setting is followed either way.
 */
@Injectable({ providedIn: 'root' })
export class SiteMotion {
  private readonly document = inject(DOCUMENT);
  private readonly reducedSignal = signal(false);

  /** Motion turned down here, on this site */
  readonly reduced = this.reducedSignal.asReadonly();

  init(): void {
    this.apply(SHARED_SETTINGS.storage.getItem(SHARED_SETTINGS.motionKey) === 'reduced');
  }

  set(reduced: boolean): void {
    this.apply(reduced);
    if (reduced) {
      SHARED_SETTINGS.storage.setItem(SHARED_SETTINGS.motionKey, 'reduced');
    } else {
      SHARED_SETTINGS.storage.removeItem(SHARED_SETTINGS.motionKey);
    }
  }

  /** Whether to skip motion: turned down here, or in the system's settings */
  shouldReduce(): boolean {
    const system = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
    return this.reduced() || system;
  }

  private apply(reduced: boolean): void {
    this.reducedSignal.set(reduced);
    this.document.documentElement.toggleAttribute('data-reduce-motion', reduced);
  }
}
