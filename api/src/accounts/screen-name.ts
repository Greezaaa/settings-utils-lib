import { z } from 'zod';

/**
 * A new or changed screen name: one word of 3 to 12 letters in any alphabet (ñ, accents, Cyrillic). No digits, so
 * no ages, years or phone numbers, and no spaces or symbols to hide words with. Names from before this rule keep
 * working on the leaderboards, but only names that follow it show in rooms.
 */
export const SCREEN_NAME_PATTERN = /^\p{L}{3,12}$/u;

export const screenNameSchema = z.string().trim().regex(SCREEN_NAME_PATTERN);

/**
 * A name or word as the rude-word check compares it: lowercase, without accents, and with letters said over and over
 * said once ("puuuta" → "puta"), so the same word can't slip through dressed up
 */
export const comparableWord = (word: string): string =>
  word
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/(\p{L})\1+/gu, '$1');

/**
 * Whether a name is a known rude word, in any language. Only the whole name counts: a rude word inside a longer name
 * may be innocent (and every new name waits for a moderator anyway).
 */
export function isRudeName(name: string, rudeWords: Iterable<string>): boolean {
  const comparable = comparableWord(name);
  for (const word of rudeWords) {
    if (comparableWord(word) === comparable) {
      return true;
    }
  }
  return false;
}
