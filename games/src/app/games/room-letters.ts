import { firstVowelWords, GapWord, missingVowelWords, mixedWords, WordBank } from './letter-games';
import { seededRandom } from './random';
import { RoomLetters } from './room-games';

export const ROOM_WORD_COUNT = 120;

export type RoomWords = { readonly gaps: readonly GapWord[] } | { readonly mixed: readonly string[] };

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
