import { computed, DestroyRef, inject, signal } from '@angular/core';
import { AnswerWords } from '../core/answer-words';

/** How long an answer shows in colour, and longer with words, so they can be read */
const FLASH_MS = 450;
const WORDS_MS = 1200;

/**
 * The moment a round shows an answer green or red before moving on (math rounds). Call it in a component's field
 * initializer; a pending timer is cleared when the round goes away.
 */
export function answerFlash() {
  const words = inject(AnswerWords);
  let timer: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(timer));

  const result = signal<boolean | null>(null);
  return {
    /** Right or wrong while showing, null otherwise */
    result: result.asReadonly(),
    isShowing: computed(() => result() !== null),
    /** Shows the answer, then runs `after` (e.g. tell the game) */
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
