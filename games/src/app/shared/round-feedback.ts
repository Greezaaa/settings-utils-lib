import { DestroyRef, inject, signal } from '@angular/core';

export const WRONG_MS = 450;

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
    wrong(after?: () => void): void {
      isWrong.set(true);
      later(WRONG_MS, () => {
        isWrong.set(false);
        after?.();
      });
    },
  };
}
