import { HintsId, WordBank } from './letter-games';
import { pick, Random } from './random';

/**
 * Secret word: rules only, no Angular, so they can be tested on their own. The player guesses a hidden word in a few
 * tries; after each guess every letter is marked as in the right place, in the word but elsewhere, or not in it.
 * Any letters of the right length make a guess, so young players needn't spell a real word to try one. With hints,
 * the word's picture is shown, and the word is then one of the pictures.
 */

export type SecretLevelId = 'easy' | 'normal' | 'hard';

export interface SecretLevel {
  readonly id: SecretLevelId;
  /** Letters in the secret word */
  readonly length: number;
}

export const SECRET_LEVELS: readonly SecretLevel[] = [
  { id: 'easy', length: 4 },
  { id: 'normal', length: 5 },
  { id: 'hard', length: 6 },
];

export const DEFAULT_SECRET_LEVEL: SecretLevelId = 'easy';
/** Without the picture by default: with it, the word is easy to tell */
export const DEFAULT_SECRET_HINTS: HintsId = 'no-hints';

/** Guesses a game allows */
export const MAX_GUESSES = 6;

/** Letters on each row of the on-screen keyboard, at most */
const KEYBOARD_ROW = 10;

/** A word to guess, with its picture when hints are on */
export interface SecretWord {
  readonly word: string;
  readonly picture: string | null;
}

/** How a guessed letter matches the secret word */
export type LetterMark = 'right' | 'present' | 'absent';

/** Better marks win on the keyboard: a letter once right stays right */
const MARK_RANK: Readonly<Record<LetterMark, number>> = { absent: 0, present: 1, right: 2 };

export function getSecretLevel(id: SecretLevelId): SecretLevel {
  const level = SECRET_LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

/** The words a level can hide in a language, each once: with hints only those with a picture, which they carry */
export function secretWords(bank: WordBank, level: SecretLevel, hints: HintsId): SecretWord[] {
  const fits = (word: string): boolean => Array.from(word).length === level.length;
  const words: SecretWord[] = hints === 'hints'
    ? bank.pictures.map(({ word, emoji }) => ({ word, picture: emoji }))
    : [...bank.pictures.map(({ word }) => word), ...bank.words].map((word) => ({ word, picture: null }));
  const byWord = new Map(words.filter(({ word }) => fits(word)).map((secret) => [secret.word, secret]));
  return [...byWord.values()];
}

/** A random word to guess, other than the last one when there's a choice */
export function pickSecret(words: readonly SecretWord[], random: Random, last: string | null = null): SecretWord {
  const others = words.filter(({ word }) => word !== last);
  return pick(others.length > 0 ? others : words, random);
}

/**
 * The marks of a guess, letter by letter. Right letters count first; a letter elsewhere in the word is marked present
 * only as many times as the word has it left, so guessing `ee` against `bed` marks one `e`.
 */
export function markGuess(guess: readonly string[], secret: readonly string[]): LetterMark[] {
  const marks: LetterMark[] = guess.map((letter, index) => (letter === secret[index] ? 'right' : 'absent'));
  const left = secret.filter((letter, index) => marks[index] !== 'right');
  guess.forEach((letter, index) => {
    const at = left.indexOf(letter);
    if (marks[index] !== 'right' && at >= 0) {
      marks[index] = 'present';
      left.splice(at, 1);
    }
  });
  return marks;
}

/** The best mark each letter has had so far, for the keyboard */
export function keyMarks(guesses: readonly (readonly string[])[], secret: readonly string[]): ReadonlyMap<string, LetterMark> {
  const best = new Map<string, LetterMark>();
  for (const guess of guesses) {
    markGuess(guess, secret).forEach((mark, index) => {
      const known = best.get(guess[index]);
      if (known === undefined || MARK_RANK[mark] > MARK_RANK[known]) {
        best.set(guess[index], mark);
      }
    });
  }
  return best;
}

/** The on-screen keyboard: every letter of the language's words, in alphabet order, in rows of about equal length */
export function keyboardRows(bank: WordBank, language: string): string[][] {
  const words = [...bank.pictures.map(({ word }) => word), ...bank.words];
  const letters = [...new Set(words.flatMap((word) => Array.from(word)))].sort((first, second) =>
    first.localeCompare(second, language),
  );
  const rowCount = Math.ceil(letters.length / KEYBOARD_ROW);
  const rowLength = Math.ceil(letters.length / rowCount);
  return Array.from({ length: rowCount }, (_, row) => letters.slice(row * rowLength, (row + 1) * rowLength));
}
