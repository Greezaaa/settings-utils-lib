import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { observeSuScrollSpySection, SuScrollSpyController } from './scroll-spy.controller';

/** Minimal IntersectionObserver stand-in; jsdom doesn't implement it */
class FakeIntersectionObserver implements IntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin: string;
  readonly scrollMargin = '';
  readonly thresholds: readonly number[] = [0];
  readonly observed: Element[] = [];
  readonly disconnect = vi.fn();
  readonly unobserve = vi.fn();
  readonly takeRecords = (): IntersectionObserverEntry[] => [];

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    this.rootMargin = options?.rootMargin ?? '';
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  /** Simulate the observed element entering or leaving the viewport center */
  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this);
  }
}

describe('observeSuScrollSpySection', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should observe the element at the vertical center of the viewport', () => {
    const element = document.createElement('section');
    observeSuScrollSpySection(element, vi.fn());

    const [observer] = FakeIntersectionObserver.instances;
    expect(observer.observed).toEqual([element]);
    expect(observer.options?.rootMargin).toBe('-50% 0px -50% 0px');
  });

  it('should call onActive only when the section is intersecting', () => {
    const onActive = vi.fn();
    observeSuScrollSpySection(document.createElement('section'), onActive);
    const [observer] = FakeIntersectionObserver.instances;

    observer.trigger(false);
    expect(onActive).not.toHaveBeenCalled();

    observer.trigger(true);
    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it('should disconnect the observer when stopped', () => {
    const stop = observeSuScrollSpySection(document.createElement('section'), vi.fn());

    stop();

    expect(FakeIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
  });

  it('should do nothing when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const stop = observeSuScrollSpySection(document.createElement('section'), vi.fn());

    expect(() => stop()).not.toThrow();
  });
});

describe('SuScrollSpyController', () => {
  let controller: SuScrollSpyController;

  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    controller = new SuScrollSpyController();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should start with an empty active section', () => {
    expect(controller.activeSection.get()).toBe('');
  });

  it('should update the active section when a tracked section becomes active', () => {
    controller.observe(document.createElement('section'), 'home');
    controller.observe(document.createElement('section'), 'about');
    const [home, about] = FakeIntersectionObserver.instances;

    home.trigger(true);
    expect(controller.activeSection.get()).toBe('home');

    about.trigger(true);
    expect(controller.activeSection.get()).toBe('about');
  });

  it('should allow setting the active section manually', () => {
    const listener = vi.fn();
    controller.activeSection.subscribe(listener);

    controller.setActiveSection('contact');

    expect(listener).toHaveBeenLastCalledWith('contact');
  });

  it('should stop tracking one section', () => {
    const stop = controller.observe(document.createElement('section'), 'home');

    stop();

    expect(FakeIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();
  });

  it('should stop tracking all sections on destroy', () => {
    controller.observe(document.createElement('section'), 'home');
    controller.observe(document.createElement('section'), 'about');

    controller.destroy();

    FakeIntersectionObserver.instances.forEach((observer) => expect(observer.disconnect).toHaveBeenCalled());
  });
});
