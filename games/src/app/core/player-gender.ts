import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { WordGender } from '../i18n/word-gender';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'word-gender';

/**
 * The player's choice, in the header settings, to be spoken to as a boy or a girl, so lines like "Estoy listo" or
 * "Estoy lista" fit them. Remembered in this browser only, never sent anywhere. The setting only shows, and the texts
 * only change, while its feature switch (`word-gender`) is on; until then (and until the player chooses) the texts
 * use the boy's forms, as they always did.
 */
@Injectable({ providedIn: 'root' })
export class PlayerGender {
  private readonly features = inject(FeatureFlags);
  private readonly chosen = signal<WordGender | null>(null);

  readonly isAvailable = computed(() => this.features.canUse('word-gender'));
  /** What the player chose, or null */
  readonly choice = this.chosen.asReadonly();
  /** The forms the texts use */
  readonly wordGender = computed<WordGender>(() => (this.isAvailable() && this.chosen() === 'girl' ? 'girl' : 'boy'));

  constructor() {
    afterNextRender(() => {
      const stored = readStored(STORAGE);
      if (stored === 'boy' || stored === 'girl') {
        this.chosen.set(stored);
      }
    });
  }

  set(gender: WordGender): void {
    this.chosen.set(gender);
    writeStored(STORAGE, gender);
  }
}
