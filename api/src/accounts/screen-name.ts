import { z } from 'zod';

export const SCREEN_NAME_PATTERN = /^\p{L}{3,12}$/u;

export const screenNameSchema = z.string().trim().regex(SCREEN_NAME_PATTERN);

export const comparableWord = (word: string): string =>
  word
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/(\p{L})\1+/gu, '$1');

export function isRudeName(name: string, rudeWords: Iterable<string>): boolean {
  const comparable = comparableWord(name);
  for (const word of rudeWords) {
    if (comparableWord(word) === comparable) {
      return true;
    }
  }
  return false;
}
