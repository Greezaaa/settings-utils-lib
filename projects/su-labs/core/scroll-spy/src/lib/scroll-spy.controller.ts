import { createSuStore, isBrowser, SuReadableStore, SuUnsubscribe } from '@su-labs/core';

/**
 * IntersectionObserver settings used for every tracked section.
 *
 * `rootMargin: '-50% 0px -50% 0px'` shrinks the viewport to a line at its vertical center,
 * so a section counts as active while it crosses the middle of the screen rather than as
 * soon as it appears at the top or bottom.
 */
const SECTION_OBSERVER_OPTIONS: IntersectionObserverInit = {
  root: null,
  threshold: 0,
  rootMargin: '-50% 0px -50% 0px',
};

/**
 * Watch a section and call `onActive` whenever it reaches the vertical center of the viewport.
 * Does nothing outside a browser or when IntersectionObserver is unavailable.
 *
 * @param element The section element to watch.
 * @param onActive Called each time the section becomes active.
 * @returns Function that stops watching the section.
 */
export function observeSuScrollSpySection(element: Element, onActive: () => void): SuUnsubscribe {
  if (!isBrowser() || typeof IntersectionObserver === 'undefined') {
    return () => undefined;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      onActive();
    }
  }, SECTION_OBSERVER_OPTIONS);

  observer.observe(element);
  return () => observer.disconnect();
}

/**
 * Framework-agnostic scroll spy.
 *
 * Tracks which page section is currently in the middle of the viewport and exposes its ID
 * as a reactive store, for example to highlight the matching navigation link.
 */
export class SuScrollSpyController {
  /** ID of the currently active section ('' until a section becomes active) */
  private readonly activeSectionStore = createSuStore<string>('');

  /** Stop functions for every observed section */
  private readonly stopFunctions = new Set<SuUnsubscribe>();

  /** Reactive, read-only ID of the active section */
  readonly activeSection: SuReadableStore<string> = this.activeSectionStore.asReadonly();

  /**
   * Start tracking a section.
   * @param element The section element.
   * @param sectionId ID reported in `activeSection` while this section is active.
   * @returns Function that stops tracking this section.
   */
  public observe(element: Element, sectionId: string): SuUnsubscribe {
    const stopObserving = observeSuScrollSpySection(element, () => this.setActiveSection(sectionId));

    const stop: SuUnsubscribe = () => {
      stopObserving();
      this.stopFunctions.delete(stop);
    };
    this.stopFunctions.add(stop);
    return stop;
  }

  /**
   * Set the active section manually, for example when a navigation link is clicked.
   * @param sectionId ID of the section.
   */
  public setActiveSection(sectionId: string): void {
    this.activeSectionStore.set(sectionId);
  }

  /** Stop tracking all sections */
  public destroy(): void {
    this.stopFunctions.forEach((stop) => stop());
  }
}
