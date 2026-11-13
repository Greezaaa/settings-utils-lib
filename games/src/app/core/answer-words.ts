import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { FeatureFlags } from './feature-flags';
import { readStored, writeStored } from './site-storage';

const STORAGE = 'answer-words';

export type AnswerStyle = 'colours' | 'words';
export const ANSWER_STYLES: readonly AnswerStyle[] = ['colours', 'words'];

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
