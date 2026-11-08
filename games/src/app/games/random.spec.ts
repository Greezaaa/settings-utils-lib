import { describe, expect, it } from 'vitest';
import { seededRandom } from './random';

describe('seededRandom', () => {
  it('gives the same numbers for the same seed, and different ones for another', () => {
    const first = seededRandom(42);
    const second = seededRandom(42);
    const numbers = Array.from({ length: 5 }, () => first());
    expect(Array.from({ length: 5 }, () => second())).toEqual(numbers);
    expect(seededRandom(43)()).not.toBe(numbers[0]);
    expect(numbers.every((number) => number >= 0 && number < 1)).toBe(true);
  });
});
