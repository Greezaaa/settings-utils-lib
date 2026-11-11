import { describe, expect, it } from 'vitest';
import { bestsToSend, isBetter, mergedBests, storedBests } from './player-results';

describe('player results', () => {
  it('knows which way each game is better', () => {
    expect(isBetter('climb-tower', 12, 7)).toBe(true);
    expect(isBetter('find-pairs', 12, 7)).toBe(false);
    expect(isBetter('find-pairs', 30, undefined)).toBe(true);
  });

  it('reads only whole, non-negative bests from the browser', () => {
    expect(storedBests('find-pairs', { normal: 16, easy: -1, hard: 2.5, expert: 'x' })).toEqual([
      { game: 'find-pairs', key: 'normal', value: 16 },
    ]);
    expect(storedBests('find-pairs', null)).toEqual([]);
  });

  it('merges the account’s bests into the browser’s, keeping the better of each', () => {
    const merged = mergedBests('find-pairs', { normal: 16, easy: 9 }, [
      { game: 'find-pairs', key: 'normal', value: 14 },
      { game: 'find-pairs', key: 'easy', value: 11 },
      { game: 'find-pairs', key: 'hard', value: 30 },
      { game: 'climb-tower', key: 'normal', value: 2 },
    ]);
    expect(merged).toEqual({ normal: 14, easy: 9, hard: 30 });
  });

  it('sends only the bests the account lacks or has worse', () => {
    const account = [
      { game: 'climb-tower' as const, key: 'a', value: 10 },
      { game: 'find-pairs' as const, key: 'a', value: 20 },
    ];
    const local = [
      { game: 'climb-tower' as const, key: 'a', value: 8 },
      { game: 'find-pairs' as const, key: 'a', value: 15 },
      { game: 'find-pairs' as const, key: 'b', value: 30 },
    ];
    expect(bestsToSend(local, account)).toEqual(local.slice(1));
    expect(bestsToSend(account, account)).toEqual([]);
  });
});
