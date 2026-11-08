import { describe, expect, it } from 'vitest';
import { cellCount } from './board';
import { dealPairs, isPair, PAIR_PICTURES, PAIRS_LEVELS } from './find-pairs';
import { seededRandom } from './random';

describe('find the pairs', () => {
  it('has enough pictures for the biggest board', () => {
    const biggest = Math.max(...PAIRS_LEVELS.map(cellCount));
    expect(PAIR_PICTURES.length).toBeGreaterThanOrEqual(biggest / 2);
  });

  it('deals every picture on exactly two cards, numbered in board order', () => {
    for (const level of PAIRS_LEVELS) {
      const cards = dealPairs(level, seededRandom(1));
      expect(cards).toHaveLength(cellCount(level));
      expect(cards.map(({ id }) => id)).toEqual(cards.map((_, index) => index));
      const counts = new Map<string, number>();
      cards.forEach(({ picture }) => counts.set(picture, (counts.get(picture) ?? 0) + 1));
      expect([...counts.values()].every((count) => count === 2)).toBe(true);
      expect(counts.size).toBe(cellCount(level) / 2);
    }
  });

  it('matches two different cards with the same picture only', () => {
    const [first, second] = [
      { id: 0, picture: '🐱' },
      { id: 1, picture: '🐱' },
    ];
    expect(isPair(first, second)).toBe(true);
    expect(isPair(first, first)).toBe(false);
    expect(isPair(first, { id: 2, picture: '🐶' })).toBe(false);
  });
});
