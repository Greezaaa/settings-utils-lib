import { describe, expect, it } from 'vitest';
import { allWords, answersFor, canMake, checkWord, createLetterSet, firstVowelWords, lettersOf, LetterSet, missingVowelWords, mixedWords, mixLetters, hintAfter, secondsForGapWord, seedWords, secondsForMixedWord, WordBank, WORDS_PER_GAME } from './letter-games';
import { LanguageId } from '../i18n/site-messages';
import { Random } from './random';
import { WORD_BANKS } from './words';

/** Always the same "random" numbers, so every run is alike */
function seeded(seed = 1): Random {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const BANK: WordBank = {
  vowels: ['a', 'e', 'i', 'o', 'u'],
  pictures: [
    { word: 'apple', emoji: '🍎' },
    { word: 'cat', emoji: '🐱' },
  ],
  words: ['cat', 'act', 'tea', 'eat', 'ate', 'seat', 'east', 'at'],
};

/** The letters each language's words may use */
const ALPHABETS: readonly (readonly [LanguageId, RegExp])[] = [
  ['en', /^[a-z]+$/],
  ['es', /^[a-zñ]+$/],
  ['eu', /^[a-zñ]+$/],
  ['uk', /^[абвгґдеєжзиіїйклмнопрстуфхцчшщьюя]+$/],
];

describe('letter games', () => {
  it('hides the first letter of words that start with a vowel', () => {
    const words = firstVowelWords(BANK, seeded(), 3);
    expect(words).toHaveLength(3);
    expect(words.every(({ picture, gaps }) => picture.word === 'apple' && gaps.join() === '0')).toBe(true);
  });

  it('hides every vowel', () => {
    const [cat] = missingVowelWords({ ...BANK, pictures: [BANK.pictures[1]] }, seeded(), 1);
    expect(cat.gaps).toEqual([1]);
    const [apple] = missingVowelWords({ ...BANK, pictures: [BANK.pictures[0]] }, seeded(), 1);
    expect(apple.gaps).toEqual([0, 4]);
  });

  it('gives longer and longer mixed words, never twice', () => {
    const words = mixedWords(WORD_BANKS.en, seeded(), WORDS_PER_GAME);
    const lengths = words.map((word) => lettersOf(word).length);
    expect(words).toHaveLength(WORDS_PER_GAME);
    expect(new Set(words).size).toBe(words.length);
    expect(lengths).toEqual([...lengths].sort((first, second) => first - second));
  });

  it('mixes the letters out of order', () => {
    const random = seeded(3);
    for (let round = 0; round < 20; round++) {
      const mixed = mixLetters('tea', random);
      expect(mixed.join('')).not.toBe('tea');
      expect([...mixed].sort()).toEqual(['a', 'e', 't']);
    }
    expect(mixLetters('zzz', random).join('')).toBe('zzz');
  });

  it('gives more time to longer words', () => {
    expect(secondsForGapWord({ picture: BANK.pictures[0], gaps: [0] })).toBe(6);
    expect(secondsForGapWord({ picture: BANK.pictures[0], gaps: [0, 4] })).toBe(8);
    expect(secondsForMixedWord('cat')).toBeLessThan(secondsForMixedWord('apple'));
  });

  it('helps more after more mistakes, never giving the whole word', () => {
    expect(hintAfter(1, 6)).toEqual({ showNext: false, revealed: 0 });
    expect(hintAfter(2, 6)).toEqual({ showNext: true, revealed: 0 });
    expect(hintAfter(5, 6)).toEqual({ showNext: true, revealed: 2 });
    expect(hintAfter(10, 6)).toEqual({ showNext: true, revealed: 4 });
    expect(hintAfter(10, 3)).toEqual({ showNext: true, revealed: 2 });
  });

  it('uses each letter at most once', () => {
    expect(canMake('seat', ['t', 'a', 'e', 's'])).toBe(true);
    expect(canMake('see', ['s', 'e'])).toBe(false);
  });

  it('finds every word the letters make, longest first', () => {
    expect(answersFor(['e', 'a', 't', 's'], BANK)).toEqual(['east', 'seat', 'ate', 'eat', 'tea']);
  });

  it('builds letter sets with the right number of letters and words to find', () => {
    for (const bank of Object.values(WORD_BANKS)) {
      for (const count of [5, 7, 10]) {
        const set = createLetterSet(bank, count, seeded(count));
        expect(set.letters).toHaveLength(count);
        expect(set.answers.length).toBeGreaterThanOrEqual(2);
        expect(set.answers.every((word) => canMake(word, set.letters))).toBe(true);
        const longest = Math.min(...seedWords(bank, count).map((word) => lettersOf(word).length));
        expect(lettersOf(set.answers[0]).length).toBeGreaterThanOrEqual(longest);
      }
    }
  });

  it('checks the words the player makes', () => {
    const set: LetterSet = { letters: ['e', 'a', 't', 's'], answers: ['east', 'eat'] };
    expect(checkWord('at', set, [])).toBe('too-short');
    expect(checkWord('eat', set, [])).toBe('found');
    expect(checkWord('eat', set, ['eat'])).toBe('already-found');
    expect(checkWord('tas', set, [])).toBe('unknown');
    expect(checkWord('sat', set, [], new Set(['sat']))).toBe('bonus');
    expect(checkWord('sat', set, ['sat'], new Set(['sat']))).toBe('already-found');
    expect(checkWord('seats', set, [], new Set(['seats']))).toBe('unknown');
  });

  it('keeps every word bank in its own alphabet, with pictures for most vowels', () => {
    for (const [language, alphabet] of ALPHABETS) {
      const bank = WORD_BANKS[language];
      expect(allWords(bank).filter((word) => !alphabet.test(word))).toEqual([]);
      const firstLetters = new Set(bank.pictures.map(({ word }) => lettersOf(word)[0]));
      expect(bank.vowels.filter((vowel) => firstLetters.has(vowel)).length).toBeGreaterThanOrEqual(5);
    }
  });
});
