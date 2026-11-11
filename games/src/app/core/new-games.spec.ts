import { describe, expect, it } from 'vitest';
import { newGames, recentlyAdded } from './new-games';
import { SiteUpdate } from './site-updates';

const text = (word: string) => ({ en: word, es: word, eu: word, uk: word });
const UPDATES: readonly SiteUpdate[] = [
  { version: 1, published: '2026-01-01T10:00:00Z', changes: [{ text: text('Math'), game: 'math-games' }] },
  {
    version: 2,
    published: '2026-01-10T10:00:00Z',
    changes: [
      { text: text('Slide'), game: 'sliding-puzzle' },
      { text: text('Turn'), game: 'turn-picture' },
      { text: text('More math'), game: 'math-games' },
    ],
  },
  { version: 3, published: '2026-01-12T10:00:00Z', changes: [{ text: text('Place'), game: 'place-pieces' }] },
];

describe('new games', () => {
  it('marks at most two of the latest games, newest first', () => {
    expect(newGames(new Date('2026-01-13T00:00:00Z'), UPDATES)).toEqual(['place-pieces', 'turn-picture']);
  });

  it('skips games hidden from the public, so the newest open ones are marked', () => {
    expect(
      newGames(new Date('2026-01-13T00:00:00Z'), UPDATES, 14, 2, (game) => game !== 'place-pieces'),
    ).toEqual(['turn-picture', 'sliding-puzzle']);
  });

  it('counts a game from the first update that mentions it', () => {
    expect(newGames(new Date('2026-01-13T00:00:00Z'), UPDATES, 14, 10)).toEqual([
      'place-pieces',
      'turn-picture',
      'sliding-puzzle',
      'math-games',
    ]);
  });

  it('stops marking a game after the given days', () => {
    expect(newGames(new Date('2026-01-25T00:00:00Z'), UPDATES)).toEqual(['place-pieces']);
    expect(newGames(new Date('2026-03-01T00:00:00Z'), UPDATES)).toEqual([]);
  });

  it('lists every added game newest first, however long ago, for "Recently added"', () => {
    expect(recentlyAdded(UPDATES)).toEqual(['place-pieces', 'turn-picture', 'sliding-puzzle', 'math-games']);
  });
});
