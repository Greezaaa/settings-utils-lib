import { BoardLevel, BoardLevelId, cellCount } from './board';
import { Random, shuffled } from './random';
import { EN_WORDS } from './words/en';

/**
 * Find the pairs: rules only, no Angular, so they can be tested on their own. Cards lie face down, each picture on
 * two of them; the player turns two at a time, a matching pair stays face up, and the game ends when every pair is
 * found. Fewer moves (pairs of cards turned) is better.
 */

/** Board sizes; Normal is the classic 24 cards, 12 pictures */
export const PAIRS_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 3, columns: 4 },
  { id: 'normal', rows: 4, columns: 6 },
  { id: 'hard', rows: 5, columns: 6 },
  { id: 'expert', rows: 6, columns: 6 },
];

export const DEFAULT_PAIRS_LEVEL: BoardLevelId = 'normal';

/** The letter games' pictures, the same in every language; one of each */
export const PAIR_PICTURES: readonly string[] = [...new Set(EN_WORDS.pictures.map(({ emoji }) => emoji))];

export interface PairCard {
  /** Its place on the board */
  readonly id: number;
  readonly picture: string;
}

/** A shuffled board for a level: half as many pictures as cards, each on two cards */
export function dealPairs(level: BoardLevel, random: Random, pictures: readonly string[] = PAIR_PICTURES): PairCard[] {
  const chosen = shuffled(pictures, random).slice(0, cellCount(level) / 2);
  return shuffled([...chosen, ...chosen], random).map((picture, id) => ({ id, picture }));
}

/** Two different cards with the same picture */
export const isPair = (first: PairCard, second: PairCard): boolean =>
  first.id !== second.id && first.picture === second.picture;
