import '@angular/compiler';
import { DOCUMENT, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LinkPreload } from './link-preload';

function preloadIn(platform: 'browser' | 'server'): LinkPreload {
  const injector = Injector.create({
    providers: [
      { provide: DOCUMENT, useValue: document },
      { provide: PLATFORM_ID, useValue: platform },
    ],
  });
  return runInInjectionContext(injector, () => new LinkPreload());
}

function linkTo(href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = href;
  document.body.append(link);
  return link;
}

describe('LinkPreload', () => {
  afterEach(() => document.body.replaceChildren());

  it('loads a page once when a link to it is pointed at, focused or touched', () => {
    const load = vi.fn(() => of(null));
    preloadIn('browser').preload({ path: 'math-games' }, load).subscribe();
    const link = linkTo('/math-games');
    expect(load).not.toHaveBeenCalled();
    link.dispatchEvent(new Event('pointerover', { bubbles: true }));
    link.dispatchEvent(new Event('focusin', { bubbles: true }));
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('skips pages with a parameter, links to other sites and the server render', () => {
    const load = vi.fn(() => of(null));
    const preload = preloadIn('browser');
    preload.preload({ path: 'r/:code' }, load).subscribe();
    preload.preload({ path: 'word-search' }, load).subscribe();
    linkTo('https://example.com/word-search').dispatchEvent(new Event('touchstart', { bubbles: true }));
    preloadIn('server').preload({ path: 'how-many' }, load).subscribe();
    linkTo('/how-many').dispatchEvent(new Event('pointerover', { bubbles: true }));
    expect(load).not.toHaveBeenCalled();
  });
});
