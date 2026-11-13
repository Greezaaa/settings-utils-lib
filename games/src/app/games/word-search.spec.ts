import { describe, expect, it } from 'vitest';
import { seededRandom } from './random';
import { createWordSearch, lineCells, SEARCH_LEVELS, wordAt } from './word-search';
import { WORD_BANKS } from './words';

describe('word search', () => {
  it('hides the words of each level in every language, spelled along their cells', () => {
    for (const bank of Object.values(WORD_BANKS)) {
      for (const level of SEARCH_LEVELS) {
        const search = createWordSearch(level, bank.pictures, seededRandom(level.size));
        expect(search.letters).toHaveLength(level.size * level.size);
        expect(search.words).toHaveLength(level.wordCount);
        for (const { word, cells } of search.words) {
          expect(cells.map((cell) => search.letters[cell]).join('')).toBe(word.word);
          expect(lineCells(cells[0], cells[cells.length - 1], level.size)).toEqual(cells);
        }
      }
    }
  });

  it('reads straight lines only: across, down and diagonal, either way', () => {
    expect(lineCells(0, 3, 4)).toEqual([0, 1, 2, 3]);
    expect(lineCells(12, 0, 4)).toEqual([12, 8, 4, 0]);
    expect(lineCells(0, 15, 4)).toEqual([0, 5, 10, 15]);
    expect(lineCells(3, 12, 4)).toEqual([3, 6, 9, 12]);
    expect(lineCells(5, 5, 4)).toEqual([5]);
    expect(lineCells(0, 6, 4)).toBeNull();
  });

  it('finds a hidden word read either way, once', () => {
    const search = {
      size: 3,
      letters: ['c', 'a', 't', 'x', 'x', 'x', 'x', 'x', 'x'],
      words: [{ word: { word: 'cat', emoji: '🐱' }, cells: [0, 1, 2] }],
    };
    expect(wordAt(search, [0, 1, 2], new Set())?.word.word).toBe('cat');
    expect(wordAt(search, [2, 1, 0], new Set())?.word.word).toBe('cat');
    expect(wordAt(search, [0, 1], new Set())).toBeNull();
    expect(wordAt(search, [0, 1, 2], new Set(['cat']))).toBeNull();
  });
});
