import { DestroyRef, inject, linkedSignal, OutputEmitterRef, Signal } from '@angular/core';

/** How long a finished puzzle stays on show before the next one */
const SOLVED_MS = 900;

/**
 * A puzzle round in a room (Sliding puzzle, Turn the picture, Place the pieces): every player works through the same
 * puzzles, one after another, scoring a point per piece in place. A finished puzzle banks all its pieces; the score
 * sent to the room is the highest so far, as pieces can move out of place again.
 */
export interface PuzzleRun {
  /** The puzzle the player is on, from 0 */
  readonly index: Signal<number>;
  /** The highest score so far: pieces of finished puzzles, plus those in place in this one */
  readonly score: Signal<number>;
  /** Pieces in place in the puzzle being solved now */
  setInPlace(pieces: number): void;
  /** The puzzle is done: its pieces are banked, and the next one comes after a moment */
  solved(pieces: number): void;
}

/** The run of a puzzle round; call it in a component's constructor. Everything restarts with a new seed. */
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
