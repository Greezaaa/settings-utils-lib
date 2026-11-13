import { DestroyRef, inject, linkedSignal, OutputEmitterRef, Signal } from '@angular/core';

const SOLVED_MS = 900;

export interface PuzzleRun {
  readonly index: Signal<number>;
  readonly score: Signal<number>;
  setInPlace(pieces: number): void;
  solved(pieces: number): void;
}

export function puzzleRun(seed: Signal<number>, scored: OutputEmitterRef<number>): PuzzleRun {
  const index = linkedSignal({ source: seed, computation: () => 0 });
  const banked = linkedSignal({ source: seed, computation: () => 0 });
  const score = linkedSignal({ source: seed, computation: () => 0 });
  let nextPuzzle: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(nextPuzzle));

  const report = (points: number): void => {
    if (points > score()) {
      score.set(points);
      scored.emit(points);
    }
  };
  return {
    index,
    score,
    setInPlace: (pieces) => report(banked() + pieces),
    solved: (pieces) => {
      banked.update((points) => points + pieces);
      report(banked());
      const solvedSeed = seed();
      nextPuzzle = setTimeout(() => {
        if (seed() === solvedSeed) {
          index.update((puzzle) => puzzle + 1);
        }
      }, SOLVED_MS);
    },
  };
}
