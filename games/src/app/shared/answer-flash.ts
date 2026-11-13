import { computed, DestroyRef, inject, signal } from '@angular/core';
import { AnswerWords } from '../core/answer-words';

const FLASH_MS = 450;
const WORDS_MS = 1200;

export function answerFlash() {
  const words = inject(AnswerWords);
  let timer: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(timer));

  const result = signal<boolean | null>(null);
  return {
    result: result.asReadonly(),
    isShowing: computed(() => result() !== null),
    show(isRight: boolean, after: () => void): void {
      result.set(isRight);
      timer = setTimeout(
        () => {
          result.set(null);
          after();
        },
        words.isOn() ? WORDS_MS : FLASH_MS,
      );
    },
  };
}
