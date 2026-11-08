/** A source of numbers in [0, 1), like `Math.random`; replaceable in tests */
export type Random = () => number;

/** Whole numbers from `min` to `max`, both included */
export interface NumberRange {
  readonly min: number;
  readonly max: number;
}

/** A whole number within the range */
export function between({ min, max }: NumberRange, random: Random): number {
  return min + Math.floor(random() * (max - min + 1));
}

/** One item of a list, chosen at random */
export function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

/** A shuffled copy of a list */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

/**
 * A repeatable source of numbers from a seed (mulberry32): the same seed gives the same numbers on every device, so
 * players in a room get the same exercises
 */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
