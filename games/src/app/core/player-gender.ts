import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { WordGender } from '../i18n/word-gender';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'word-gender';

@Injectable({ providedIn: 'root' })
export class PlayerGender {
  private readonly features = inject(FeatureFlags);
  private readonly chosen = signal<WordGender | null>(null);

  readonly isAvailable = computed(() => this.features.canUse('word-gender'));
  readonly choice = this.chosen.asReadonly();
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
