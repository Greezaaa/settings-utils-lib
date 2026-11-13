export type Random = () => number;

export interface NumberRange {
  readonly min: number;
  readonly max: number;
}

export function between({ min, max }: NumberRange, random: Random): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
