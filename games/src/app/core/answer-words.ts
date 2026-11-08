import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'answer-words';

/** How games show whether an answer was right: in colours only, or in colours and words */
export type AnswerStyle = 'colours' | 'words';
export const ANSWER_STYLES: readonly AnswerStyle[] = ['colours', 'words'];

/**
 * The visitor's choice, in the header settings, of how every game shows answers: colours only (the default), or
 * colours with a short line of words ("Right!", "Not quite: 60°"). Remembered in this browser; the setting only
 * shows, and words only appear, while its feature switch (`answer-words`) is on.
 */
@Injectable({ providedIn: 'root' })
export class AnswerWords {
  private readonly features = inject(FeatureFlags);
  private readonly chosen = signal<AnswerStyle>('colours');

  readonly isAvailable = computed(() => this.features.canUse('answer-words'));
  readonly style = computed<AnswerStyle>(() => (this.isAvailable() ? this.chosen() : 'colours'));
  readonly isOn = computed(() => this.style() === 'words');

  constructor() {
    afterNextRender(() => {
      if (readStored(STORAGE) === 'words') {
        this.chosen.set('words');
      }
    });
  }

  set(style: AnswerStyle): void {
    this.chosen.set(style);
    writeStored(STORAGE, style);
  }
}
