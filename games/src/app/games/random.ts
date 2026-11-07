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
