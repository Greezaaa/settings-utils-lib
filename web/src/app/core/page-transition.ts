import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { flyOutTransform, ScreenBox } from './page-fly-out';
import { SiteMotion } from './site-motion';

/** How long after a click its link still counts as where the next page comes from */
const ORIGIN_LIFETIME = 1000;

/** The class on `<html>` while a page flies out of a clicked link, so the stylesheet can animate it from there */
const FROM_LINK_CLASS = 'page-from-link';

/** A clicked link's box, whether it points at a spot on a page (`#…`), and when it was clicked */
interface Origin {
  readonly box: ScreenBox;
  readonly toAnchor: boolean;
  readonly at: number;
}

/**
 * Lets a new page open from the link that was clicked: it remembers the link, and once the router has put the new
 * page in place it sets the transform that lays the page over that link (`--page-fly-from`), so the page flies from
 * there to its place. The new page opens at its top before the browser pictures it (the router would scroll only
 * afterwards, making the page jump). Without a recent click (back and forward) the page cross-fades; with motion
 * turned down (here or in the system) there's no transition.
 */
@Injectable({ providedIn: 'root' })
export class PageTransition {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(SiteMotion);
  private origin: Origin | null = null;

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.document.addEventListener('click', (event) => this.remember(event), true);
    }
  }

  /** Called by the router for each view transition */
  prepare(transition: ViewTransition): void {
    if (this.motion.shouldReduce()) {
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
      const page = this.document.querySelector<HTMLElement>('.page');
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
