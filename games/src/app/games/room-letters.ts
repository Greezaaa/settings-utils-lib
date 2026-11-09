import { firstVowelWords, GapWord, missingVowelWords, mixedWords, WordBank } from './letter-games';
import { seededRandom } from './random';
import { RoomLetters } from './room-games';

/** More words than anyone can solve in the longest round (2 minutes) */
export const ROOM_WORD_COUNT = 120;

/** A room round's words, the same list on every device from the round's seed: gaps to fill, or words to unmix */
export type RoomWords = { readonly gaps: readonly GapWord[] } | { readonly mixed: readonly string[] };

/** Every word of a letters round (not the word builder, which gets a set of letters at a time) */
export function roomWords({ mode }: RoomLetters, bank: WordBank, seed: number): RoomWords {
  const random = seededRandom(seed);
  switch (mode) {
    case 'missing-vowels':
      return { gaps: missingVowelWords(bank, random, ROOM_WORD_COUNT) };
    case 'mixed-letters':
      return { mixed: mixedWords(bank, random, ROOM_WORD_COUNT) };
    default:
      return { gaps: firstVowelWords(bank, random, ROOM_WORD_COUNT) };
  }
}
