import { BoardLevel, BoardLevelId, cellCount } from './board';
import { Random, shuffled } from './random';
import { EN_WORDS } from './words/en';

export const PAIRS_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 3, columns: 4 },
  { id: 'normal', rows: 4, columns: 6 },
  { id: 'hard', rows: 5, columns: 6 },
  { id: 'expert', rows: 6, columns: 6 },
];

export const DEFAULT_PAIRS_LEVEL: BoardLevelId = 'normal';

export const PAIR_PICTURES: readonly string[] = [...new Set(EN_WORDS.pictures.map(({ emoji }) => emoji))];

export interface PairCard {
  readonly id: number;
  readonly picture: string;
}

export function dealPairs(level: BoardLevel, random: Random, pictures: readonly string[] = PAIR_PICTURES): PairCard[] {
  const chosen = shuffled(pictures, random).slice(0, cellCount(level) / 2);
  return shuffled([...chosen, ...chosen], random).map((picture, id) => ({ id, picture }));
}

export const isPair = (first: PairCard, second: PairCard): boolean =>
  first.id !== second.id && first.picture === second.picture;
