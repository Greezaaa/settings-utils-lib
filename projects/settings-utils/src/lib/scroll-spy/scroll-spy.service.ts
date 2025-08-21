import { Injectable, signal } from '@angular/core';

/**
 * Service that keeps track of the currently active section while scrolling.
 * Can be injected into components to react to section changes.
 */
@Injectable({ providedIn: 'root' })
export class ScrollSpyService {
  /** ID of the currently visible section */
  activeSection = signal<string>('');
}
