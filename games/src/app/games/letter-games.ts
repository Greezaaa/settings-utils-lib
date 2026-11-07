import { pick, Random, shuffled } from './random';

/**
 * Letter games: rules only, no Angular, so they can be tested on their own.
 *
 * - First vowel: a picture and its word without the first letter; tap the vowel it starts with.
 * - Missing vowels: a picture and its word without its vowels; tap them in order.
 * - Mixed letters: put the shuffled letters of a word in order; the words get longer as you go.
 * - Word builder: make as many words as you can from 5, 7 or 10 letters.
 *
 * Words come from a small, checked word bank per language (games/words/), so only those words count.
 */
export type LetterModeId = 'first-vowel' | 'missing-vowels' | 'mixed-letters' | 'word-builder';
export const LETTER_MODE_IDS: readonly LetterModeId[] = [
  'first-vowel',
  'missing-vowels',
  'mixed-letters',
  'word-builder',
];

/** A word with a picture (an emoji) that hints it */
export interface PictureWord {
  readonly word: string;
  readonly emoji: string;
}

/** The words of one language, all lowercase and without accent marks, so every letter has its own button */
export interface WordBank {
  /** The vowels, in the order of their buttons */
  readonly vowels: readonly string[];
  /** Words a picture can show; also count as words */
  readonly pictures: readonly PictureWord[];
  /** Common, kid-friendly words, for mixed letters and the word builder */
  readonly words: readonly string[];
}

/** Words in one game of the first three modes */
export const WORDS_PER_GAME = 10;
/** Shortest word the word builder accepts */
export const MIN_WORD_LENGTH = 3;
/** Shortest and longest words in mixed letters; they grow by one every two words */
const MIXED_LENGTHS = { min: 3, max: 8 } as const;
/** Tries before settling for a letter set with fewer words */
const LETTER_SET_TRIES = 40;
/** A letter set should hide at least this many words */
const MIN_ANSWERS = 4;

export type BuilderLevelId = 'easy' | 'normal' | 'hard';
export interface BuilderLevel {
  readonly id: BuilderLevelId;
  readonly letters: number;
  /** Time for one set of letters, with the timer on */
  readonly seconds: number;
}
export const BUILDER_LEVELS: readonly BuilderLevel[] = [
  { id: 'easy', letters: 5, seconds: 60 },
  { id: 'normal', letters: 7, seconds: 90 },
  { id: 'hard', letters: 10, seconds: 120 },
];

/** With the timer on, seconds for a word: a few to look, plus two for each letter to tap */
const SECONDS_TO_LOOK = 4;
const SECONDS_PER_LETTER = 2;

/** Time to fill the gaps of a picture word */
export function secondsForGapWord({ gaps }: GapWord): number {
  return SECONDS_TO_LOOK + SECONDS_PER_LETTER * gaps.length;
}

/** Time to put a mixed word in order */
export function secondsForMixedWord(word: string): number {
  return SECONDS_TO_LOOK + SECONDS_PER_LETTER * lettersOf(word).length;
}

/** A word split into letters; `Array.from` keeps each letter whole in every alphabet */
export const lettersOf = (word: string): string[] => Array.from(word);

/** Every word of a bank once, pictures included */
export function allWords(bank: WordBank): string[] {
  return [...new Set([...bank.words, ...bank.pictures.map(({ word }) => word)])];
}

/** A picture word with the positions of the letters the player fills in */
export interface GapWord {
  readonly picture: PictureWord;
  readonly gaps: readonly number[];
}

const vowelPositions = (word: string, vowels: readonly string[]): number[] =>
  lettersOf(word).flatMap((letter, index) => (vowels.includes(letter) ? [index] : []));

/** `count` items in random order, starting over when there are fewer */
function take<T>(items: readonly T[], count: number, random: Random): T[] {
  const result: T[] = [];
  while (items.length > 0 && result.length < count) {
    result.push(...shuffled(items, random).slice(0, count - result.length));
  }
  return result;
}

/** Pictures whose word starts with a vowel, the first letter to fill in */
export function firstVowelWords(bank: WordBank, random: Random, count = WORDS_PER_GAME): GapWord[] {
  const starting = bank.pictures.filter(({ word }) => bank.vowels.includes(lettersOf(word)[0]));
  return take(starting, count, random).map((picture) => ({ picture, gaps: [0] }));
}

/** Pictures with every vowel to fill in */
export function missingVowelWords(bank: WordBank, random: Random, count = WORDS_PER_GAME): GapWord[] {
  const withVowels = bank.pictures.filter(({ word }) => vowelPositions(word, bank.vowels).length > 0);
  return take(withVowels, count, random).map((picture) => ({
    picture,
    gaps: vowelPositions(picture.word, bank.vowels),
  }));
}

/** Words for mixed letters, getting longer: two of 3 letters, two of 4… up to 8, never the same word twice */
export function mixedWords(bank: WordBank, random: Random, count = WORDS_PER_GAME): string[] {
  const unused = new Set(allWords(bank));
  const words: string[] = [];
  for (let index = 0; index < count; index++) {
    const wanted = Math.min(MIXED_LENGTHS.min + Math.floor(index / 2), MIXED_LENGTHS.max);
    // The wanted length, or the nearest one the bank still has
    const candidates = [...unused].filter((word) => lettersOf(word).length >= MIXED_LENGTHS.min);
    if (candidates.length === 0) {
      break;
    }
    const distance = (word: string) => Math.abs(lettersOf(word).length - wanted);
    const nearest = Math.min(...candidates.map(distance));
    const word = pick(
      candidates.filter((candidate) => distance(candidate) === nearest),
      random,
    );
    unused.delete(word);
    words.push(word);
  }
  return words;
}

/** A word's letters shuffled, never left in the right order when they can be mixed */
export function mixLetters(word: string, random: Random): string[] {
  const letters = lettersOf(word);
  const canMix = new Set(letters).size > 1;
  let mixed = shuffled(letters, random);
  while (canMix && mixed.join('') === word) {
    mixed = shuffled(letters, random);
  }
  return mixed;
}

export type HintsId = 'hints' | 'no-hints';
export const HINTS_IDS: readonly HintsId[] = ['hints', 'no-hints'];

/** Help for a word after some mistakes on it */
export interface Hint {
  /** Light up the letter that comes next */
  readonly showNext: boolean;
  /** How many letters from the start are placed for the player */
  readonly revealed: number;
}

/** Mistakes on one word before each hint: light up the next letter, then place the first two, then four */
const SHOW_NEXT_AFTER = 2;
const REVEAL_AFTER: readonly { readonly mistakes: number; readonly letters: number }[] = [
  { mistakes: 10, letters: 4 },
  { mistakes: 5, letters: 2 },
];

/** The hint for a word after `mistakes` mistakes on it; never reveals the whole word */
export function hintAfter(mistakes: number, wordLength: number): Hint {
  const revealed = REVEAL_AFTER.find((step) => mistakes >= step.mistakes)?.letters ?? 0;
  return { showNext: mistakes >= SHOW_NEXT_AFTER, revealed: Math.min(revealed, Math.max(wordLength - 1, 0)) };
}

/** Whether a word can be made with the letters, each used at most once */
export function canMake(word: string, letters: readonly string[]): boolean {
  const left = [...letters];
  return lettersOf(word).every((letter) => {
    const index = left.indexOf(letter);
    if (index === -1) {
      return false;
    }
    left.splice(index, 1);
    return true;
  });
}

/** The word builder's letters and every bank word they make, longest first */
export interface LetterSet {
  readonly letters: readonly string[];
  readonly answers: readonly string[];
}

/** Every bank word the letters make */
export function answersFor(letters: readonly string[], bank: WordBank): string[] {
  return allWords(bank)
    .filter((word) => lettersOf(word).length >= MIN_WORD_LENGTH && canMake(word, letters))
    .sort((first, second) => lettersOf(second).length - lettersOf(first).length || first.localeCompare(second));
}

/**
 * Letters for the word builder: a bank word that fits, topped up with letters of other words, so there is always
 * one long word to find. Tries a few sets and keeps the one that makes the most words.
 */
export function createLetterSet(bank: WordBank, count: number, random: Random): LetterSet {
  const words = allWords(bank);
  const seeds = words.filter((word) => {
    const length = lettersOf(word).length;
    return length <= count && length >= Math.min(count, MIXED_LENGTHS.max) - 3;
  });
  const fillers = words.flatMap(lettersOf);
  let best: LetterSet = { letters: [], answers: [] };
  for (let attempt = 0; attempt < LETTER_SET_TRIES && best.answers.length < MIN_ANSWERS; attempt++) {
    const letters = lettersOf(pick(seeds, random));
    while (letters.length < count) {
      letters.push(pick(fillers, random));
    }
    const answers = answersFor(letters, bank);
    if (answers.length > best.answers.length) {
      best = { letters: shuffled(letters, random), answers };
    }
  }
  return best;
}

export type WordCheck = 'found' | 'already-found' | 'too-short' | 'unknown';

/** What a word the player made counts as */
export function checkWord(word: string, set: LetterSet, found: readonly string[]): WordCheck {
  if (lettersOf(word).length < MIN_WORD_LENGTH) {
    return 'too-short';
  }
  if (found.includes(word)) {
    return 'already-found';
  }
  return set.answers.includes(word) ? 'found' : 'unknown';
}
