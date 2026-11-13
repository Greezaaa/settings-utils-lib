import { HintsId, WordBank } from './letter-games';
import { pick, Random } from './random';

export type SecretLevelId = 'easy' | 'normal' | 'hard';

export interface SecretLevel {
  readonly id: SecretLevelId;
  readonly length: number;
}

export const SECRET_LEVELS: readonly SecretLevel[] = [
  { id: 'easy', length: 4 },
  { id: 'normal', length: 5 },
  { id: 'hard', length: 6 },
];

export const DEFAULT_SECRET_LEVEL: SecretLevelId = 'easy';
export const DEFAULT_SECRET_HINTS: HintsId = 'no-hints';

export const MAX_GUESSES = 6;

const KEYBOARD_ROW = 10;

export interface SecretWord {
  readonly word: string;
  readonly picture: string | null;
}

export type LetterMark = 'right' | 'present' | 'absent';

const MARK_RANK: Readonly<Record<LetterMark, number>> = { absent: 0, present: 1, right: 2 };

export function getSecretLevel(id: SecretLevelId): SecretLevel {
  const level = SECRET_LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

export function secretWords(bank: WordBank, level: SecretLevel, hints: HintsId): SecretWord[] {
  const fits = (word: string): boolean => Array.from(word).length === level.length;
  const words: SecretWord[] = hints === 'hints'
    ? bank.pictures.map(({ word, emoji }) => ({ word, picture: emoji }))
    : [...bank.pictures.map(({ word }) => word), ...bank.words].map((word) => ({ word, picture: null }));
  const byWord = new Map(words.filter(({ word }) => fits(word)).map((secret) => [secret.word, secret]));
  return [...byWord.values()];
}

export function pickSecret(words: readonly SecretWord[], random: Random, last: string | null = null): SecretWord {
  const others = words.filter(({ word }) => word !== last);
  return pick(others.length > 0 ? others : words, random);
}

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

export function keyboardRows(bank: WordBank, language: string): string[][] {
  const words = [...bank.pictures.map(({ word }) => word), ...bank.words];
  const letters = [...new Set(words.flatMap((word) => Array.from(word)))].sort((first, second) =>
    first.localeCompare(second, language),
  );
  const rowCount = Math.ceil(letters.length / KEYBOARD_ROW);
  const rowLength = Math.ceil(letters.length / rowCount);
  return Array.from({ length: rowCount }, (_, row) => letters.slice(row * rowLength, (row + 1) * rowLength));
}
