import { pick, Random, shuffled } from './random';

export type LetterModeId = 'first-vowel' | 'missing-vowels' | 'mixed-letters' | 'word-builder';
export const LETTER_MODE_IDS: readonly LetterModeId[] = [
  'first-vowel',
  'missing-vowels',
  'mixed-letters',
  'word-builder',
];

export interface PictureWord {
  readonly word: string;
  readonly emoji: string;
}

export interface WordBank {
  readonly vowels: readonly string[];
  readonly pictures: readonly PictureWord[];
  readonly words: readonly string[];
}

export const WORDS_PER_GAME = 10;
export const MIN_WORD_LENGTH = 3;
const MIXED_LENGTHS = { min: 3, max: 8 } as const;
const LETTER_SET_TRIES = 40;
const MIN_ANSWERS = 4;
const MIN_SEEDS = 8;

export type BuilderLevelId = 'easy' | 'normal' | 'hard';
export interface BuilderLevel {
  readonly id: BuilderLevelId;
  readonly letters: number;
  readonly seconds: number;
}
export const BUILDER_LEVELS: readonly BuilderLevel[] = [
  { id: 'easy', letters: 5, seconds: 60 },
  { id: 'normal', letters: 7, seconds: 90 },
  { id: 'hard', letters: 10, seconds: 120 },
];

const SECONDS_TO_LOOK = 4;
const SECONDS_PER_LETTER = 2;

export function secondsForGapWord({ gaps }: GapWord): number {
  return SECONDS_TO_LOOK + SECONDS_PER_LETTER * gaps.length;
}

export function secondsForMixedWord(word: string): number {
  return SECONDS_TO_LOOK + SECONDS_PER_LETTER * lettersOf(word).length;
}

export const lettersOf = (word: string): string[] => Array.from(word);

export function allWords(bank: WordBank): string[] {
  return [...new Set([...bank.words, ...bank.pictures.map(({ word }) => word)])];
}

export interface GapWord {
  readonly picture: PictureWord;
  readonly gaps: readonly number[];
}

const vowelPositions = (word: string, vowels: readonly string[]): number[] =>
  lettersOf(word).flatMap((letter, index) => (vowels.includes(letter) ? [index] : []));

function take<T>(items: readonly T[], count: number, random: Random): T[] {
  const result: T[] = [];
  while (items.length > 0 && result.length < count) {
    result.push(...shuffled(items, random).slice(0, count - result.length));
  }
  return result;
}

export function firstVowelWords(bank: WordBank, random: Random, count = WORDS_PER_GAME): GapWord[] {
  const starting = bank.pictures.filter(({ word }) => bank.vowels.includes(lettersOf(word)[0]));
  return take(starting, count, random).map((picture) => ({ picture, gaps: [0] }));
}

export function missingVowelWords(bank: WordBank, random: Random, count = WORDS_PER_GAME): GapWord[] {
  const withVowels = bank.pictures.filter(({ word }) => vowelPositions(word, bank.vowels).length > 0);
  return take(withVowels, count, random).map((picture) => ({
    picture,
    gaps: vowelPositions(picture.word, bank.vowels),
  }));
}

export function mixedWords(bank: WordBank, random: Random, count = WORDS_PER_GAME): string[] {
  const unused = new Set(allWords(bank));
  const words: string[] = [];
  for (let index = 0; index < count; index++) {
    const wanted = Math.min(MIXED_LENGTHS.min + Math.floor(index / 2), MIXED_LENGTHS.max);
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

export interface Hint {
  readonly showNext: boolean;
  readonly revealed: number;
}

const SHOW_NEXT_AFTER = 2;
const REVEAL_AFTER: readonly { readonly mistakes: number; readonly letters: number }[] = [
  { mistakes: 10, letters: 4 },
  { mistakes: 5, letters: 2 },
];

export function hintAfter(mistakes: number, wordLength: number): Hint {
  const revealed = REVEAL_AFTER.find((step) => mistakes >= step.mistakes)?.letters ?? 0;
  return { showNext: mistakes >= SHOW_NEXT_AFTER, revealed: Math.min(revealed, Math.max(wordLength - 1, 0)) };
}

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

export interface LetterSet {
  readonly letters: readonly string[];
  readonly answers: readonly string[];
}

export function answersFor(letters: readonly string[], bank: WordBank): string[] {
  return allWords(bank)
    .filter((word) => lettersOf(word).length >= MIN_WORD_LENGTH && canMake(word, letters))
    .sort((first, second) => lettersOf(second).length - lettersOf(first).length || first.localeCompare(second));
}

export function seedWords(bank: WordBank, count: number): string[] {
  const words = allWords(bank);
  for (let shortest = count - Math.floor(count / 4); shortest >= MIN_WORD_LENGTH; shortest--) {
    const seeds = words.filter((word) => {
      const length = lettersOf(word).length;
      return length >= shortest && length <= count;
    });
    if (seeds.length >= MIN_SEEDS) {
      return seeds;
    }
  }
  return words.filter((word) => lettersOf(word).length <= count);
}

export function createLetterSet(bank: WordBank, count: number, random: Random): LetterSet {
  const words = allWords(bank);
  const seeds = seedWords(bank, count);
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

export const MAX_TARGET_WORDS = 30;

export function targetWords(set: LetterSet, common: Iterable<string> = []): string[] {
  const fromDictionary: string[] = [];
  for (const word of common) {
    if (fromDictionary.length >= MAX_TARGET_WORDS) {
      break;
    }
    const isNew = !set.answers.includes(word) && !fromDictionary.includes(word);
    if (isNew && lettersOf(word).length >= MIN_WORD_LENGTH && canMake(word, set.letters)) {
      fromDictionary.push(word);
    }
  }
  const room = Math.max(0, MAX_TARGET_WORDS - set.answers.length);
  return [...set.answers, ...fromDictionary.slice(0, room)].sort(
    (first, second) => lettersOf(second).length - lettersOf(first).length || first.localeCompare(second),
  );
}

export function checkWord(
  word: string,
  set: LetterSet,
  targets: readonly string[],
  found: readonly string[],
  dictionary?: ReadonlySet<string>,
): WordCheck {
  if (lettersOf(word).length < MIN_WORD_LENGTH) {
    return 'too-short';
  }
  if (found.includes(word)) {
    return 'already-found';
  }
  const isReal = targets.includes(word) || set.answers.includes(word) || dictionary?.has(word) === true;
  return isReal && canMake(word, set.letters) ? 'found' : 'unknown';
}
