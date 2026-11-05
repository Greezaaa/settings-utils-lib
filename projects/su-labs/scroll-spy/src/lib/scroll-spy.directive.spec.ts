import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { ScrollSpyDirective } from './scroll-spy.directive';
import { ScrollSpyService } from './scroll-spy.service';

let observerCallback: IntersectionObserverCallback | null = null;
const disconnect = vi.fn();

/** Minimal IntersectionObserver stand-in; jsdom doesn't implement it */
class FakeIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [0];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = disconnect;
  readonly takeRecords = (): IntersectionObserverEntry[] => [];

  constructor(callback: IntersectionObserverCallback) {
    observerCallback = callback;
  }
}

describe('ScrollSpyDirective', () => {
  let service: ScrollSpyService;
  let directive: ScrollSpyDirective;

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    disconnect.mockClear();
    service = new ScrollSpyService();
    const injector = Injector.create({
      providers: [
        { provide: ScrollSpyService, useValue: service },
        { provide: ElementRef, useValue: new ElementRef(document.createElement('section')) },
      ],
    });
    directive = runInInjectionContext(injector, () => new ScrollSpyDirective());
    directive.sectionId = 'about';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should set the active section when its element becomes active', () => {
    directive.ngOnInit();

    observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], new FakeIntersectionObserver(vi.fn()));

    expect(service.activeSection()).toBe('about');
  });

  it('should stop observing on destroy', () => {
    directive.ngOnInit();
    directive.ngOnDestroy();

    expect(disconnect).toHaveBeenCalled();
  });
});
