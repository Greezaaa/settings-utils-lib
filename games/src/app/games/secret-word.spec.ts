import { describe, expect, it } from 'vitest';
import { HINTS_IDS } from './letter-games';
import { seededRandom } from './random';
import { keyboardRows, keyMarks, markGuess, pickSecret, SECRET_LEVELS, secretWords } from './secret-word';
import { WORD_BANKS } from './words';

const letters = (word: string): string[] => Array.from(word);

describe('secret word', () => {
  it('has several words of the right length for every level, with hints or not, in every language', () => {
    for (const bank of Object.values(WORD_BANKS)) {
      for (const level of SECRET_LEVELS) {
        for (const hints of HINTS_IDS) {
          const words = secretWords(bank, level, hints);
          expect(words.length).toBeGreaterThanOrEqual(8);
          expect(words.every(({ word }) => letters(word).length === level.length)).toBe(true);
          expect(words.every(({ picture }) => (picture !== null) === (hints === 'hints'))).toBe(true);
          expect(new Set(words.map(({ word }) => word)).size).toBe(words.length);
        }
      }
    }
  });

  it('every word can be typed on its language keyboard', () => {
    for (const [language, bank] of Object.entries(WORD_BANKS)) {
      const keys = new Set(keyboardRows(bank, language).flat());
      for (const level of SECRET_LEVELS) {
        expect(secretWords(bank, level, 'no-hints').every(({ word }) => letters(word).every((letter) => keys.has(letter)))).toBe(true);
      }
    }
  });

  it('marks letters right, present or absent, counting repeated letters only as often as the word has them', () => {
    expect(markGuess(letters('cat'), letters('cat'))).toEqual(['right', 'right', 'right']);
    expect(markGuess(letters('act'), letters('cat'))).toEqual(['present', 'present', 'right']);
    expect(markGuess(letters('dog'), letters('cat'))).toEqual(['absent', 'absent', 'absent']);
    expect(markGuess(letters('eex'), letters('bed'))).toEqual(['absent', 'right', 'absent']);
    expect(markGuess(letters('xee'), letters('ebd'))).toEqual(['absent', 'present', 'absent']);
  });

  it('keeps the best mark of each letter for the keyboard', () => {
    const marks = keyMarks([letters('tac'), letters('cat')], letters('cat'));
    expect(marks.get('c')).toBe('right');
    expect(marks.get('t')).toBe('right');
  });

  it('picks another word than the last one', () => {
    const words = [
      { word: 'cat', picture: null },
      { word: 'dog', picture: null },
    ];
    for (let seed = 0; seed < 10; seed++) {
      expect(pickSecret(words, seededRandom(seed), 'cat').word).toBe('dog');
    }
  });
});
