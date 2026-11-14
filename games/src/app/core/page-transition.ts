import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { flyOutTransform, ScreenBox } from './page-fly-out';
import { SiteMotion } from './site-motion';

const ORIGIN_LIFETIME = 1000;
const FROM_LINK_CLASS = 'page-from-link';

interface Origin {
  readonly box: ScreenBox;
  readonly toAnchor: boolean;
  readonly at: number;
}

@Injectable({ providedIn: 'root' })
export class PageTransition {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(SiteMotion);
  private readonly features = inject(FeatureFlags);
  private origin: Origin | null = null;

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.document.addEventListener('click', (event) => this.remember(event), true);
    }
  }

  prepare(transition: ViewTransition): void {
    if (!this.features.canUse('page-fly-out') || this.motion.shouldReduce()) {
      transition.ready.catch(() => null);
      transition.skipTransition();
      return;
    }
    const origin = this.origin;
    this.origin = null;
    if (!origin || Date.now() - origin.at > ORIGIN_LIFETIME) {
      return;
    }
    const root = this.document.documentElement;
    transition.updateCallbackDone.then(() => {
      if (!origin.toAnchor) {
        this.document.defaultView?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      const page = this.document.querySelector<HTMLElement>('#main');
      if (page) {
        root.style.setProperty('--page-fly-from', flyOutTransform(origin.box, page.getBoundingClientRect()));
        root.classList.add(FROM_LINK_CLASS);
      }
    });
    transition.finished.finally(() => root.classList.remove(FROM_LINK_CLASS));
  }

  private remember(event: MouseEvent): void {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (link) {
      this.origin = {
        box: link.getBoundingClientRect(),
        toAnchor: (link.getAttribute('href') ?? '').includes('#'),
        at: Date.now(),
      };
    }
  }
}
