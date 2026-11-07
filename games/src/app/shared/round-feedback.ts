import { DestroyRef, inject, signal } from '@angular/core';

/** How long a wrong answer shakes */
export const WRONG_MS = 450;

/** The short shake a round shows on a mistake (letter and music games); a pending timer is cleared when the round goes away */
export function roundFeedback() {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  inject(DestroyRef).onDestroy(() => timers.forEach(clearTimeout));
  const later = (ms: number, run: () => void): void => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      run();
    }, ms);
    timers.add(timer);
  };

  const isWrong = signal(false);
  return {
    isWrong: isWrong.asReadonly(),
    /** Shake, then run `after` (e.g. clear the answer) */
    wrong(after?: () => void): void {
      isWrong.set(true);
      later(WRONG_MS, () => {
        isWrong.set(false);
        after?.();
      });
    },
  };
}
