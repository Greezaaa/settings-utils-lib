import { describe, expect, it } from 'vitest';
import { popularGames, toppedUp } from './popular-games';

describe('popular games', () => {
  it('marks the most played games that have enough plays', () => {
    const plays = [
      { game: 'math-games', plays: 40 },
      { game: 'letter-games', plays: 90 },
      { game: 'sliding-puzzle', plays: 25 },
      { game: 'turn-picture', plays: 5 },
      { game: 'place-pieces', plays: 4 },
    ] as const;
    expect(popularGames(plays)).toEqual(['letter-games', 'math-games', 'sliding-puzzle']);
    expect(popularGames(plays, 5)).toEqual(['letter-games', 'math-games', 'sliding-puzzle', 'turn-picture']);
    expect(popularGames(plays, 2, 100)).toEqual([]);
  });

  it('always fills the home list, most played first, so its size never changes', () => {
    const all = ['math-games', 'letter-games', 'sliding-puzzle', 'turn-picture', 'place-pieces'] as const;
    expect(toppedUp([], all)).toEqual(all.slice(0, 4));
    expect(toppedUp(['place-pieces'], all)).toEqual(['place-pieces', 'math-games', 'letter-games', 'sliding-puzzle']);
  });
});
