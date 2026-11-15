import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';

const INTENT_EVENTS = ['pointerover', 'focusin', 'touchstart'] as const;
const IDLE_FALLBACK_MS = 1000;

type PageLoader = () => Observable<unknown>;

@Injectable({ providedIn: 'root' })
export class LinkPreload implements PreloadingStrategy {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly loaders = new Map<string, PageLoader>();
  private isListening = false;
  private isScanWaiting = false;

  preload(route: Route, load: PageLoader): Observable<unknown> {
    if (!this.isBrowser || route.path === undefined || route.path.includes(':')) {
      return EMPTY;
    }
    this.loaders.set(route.path, load);
    this.listenForIntent();
    this.preloadVisibleLinksWhenIdle();
    return EMPTY;
  }

  private listenForIntent(): void {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    for (const name of INTENT_EVENTS) {
      this.document.addEventListener(name, (event) => this.preloadTarget(event), { capture: true, passive: true });
    }
  }

  private preloadVisibleLinksWhenIdle(): void {
    const view = this.document.defaultView;
    if (this.isScanWaiting || !view || this.savesData(view)) {
      return;
    }
    this.isScanWaiting = true;
    const scan = (): void => {
      this.isScanWaiting = false;
      this.preloadVisibleLinks(view);
    };
    if (typeof view.requestIdleCallback === 'function') {
      view.requestIdleCallback(scan);
    } else {
      view.setTimeout(scan, IDLE_FALLBACK_MS);
    }
  }

  private preloadVisibleLinks(view: Window): void {
    for (const link of this.document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const { top, bottom } = link.getBoundingClientRect();
      if (bottom > 0 && top < view.innerHeight) {
        this.preloadLink(link);
      }
    }
  }

  private preloadTarget(event: Event): void {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (link instanceof HTMLAnchorElement) {
      this.preloadLink(link);
    }
  }

  private preloadLink(link: HTMLAnchorElement): void {
    if (link.origin !== this.document.location.origin) {
      return;
    }
    const path = link.pathname.replace(/^\/+|\/+$/g, '');
    const load = this.loaders.get(path);
    if (!load) {
      return;
    }
    this.loaders.delete(path);
    load().subscribe({ error: () => this.loaders.set(path, load) });
  }

  private savesData(view: Window): boolean {
    const connection: unknown = Reflect.get(view.navigator, 'connection');
    return Reflect.get(Object(connection), 'saveData') === true;
  }
}
