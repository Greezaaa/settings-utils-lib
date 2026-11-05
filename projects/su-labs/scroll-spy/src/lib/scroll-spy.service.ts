import { Injectable, signal } from '@angular/core';

/**
 * Service that keeps track of the currently active section while scrolling.
 * Can be injected into components to react to section changes.
 *
 * Sections are tracked by `ScrollSpyDirective`, which uses the framework-agnostic
 * observer from `@su-labs/core/scroll-spy`.
 */
@Injectable({ providedIn: 'root' })
export class ScrollSpyService {
  /** ID of the currently visible section ('' until a section becomes active) */
  activeSection = signal<string>('');

  /**
   * Set the active section manually, for example when a navigation link is clicked.
   * @param id ID of the section.
   */
  setActiveSection(id: string): void {
    this.activeSection.set(id);
  }
}
