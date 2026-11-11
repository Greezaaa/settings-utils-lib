import { pick, Random } from './random';

/** How many things a round can have at most: up to 3 for a start, then 5, 7 and 10 as counting gets easy */
export type HowManyLevelId = 'easy' | 'normal' | 'hard' | 'expert';

export interface HowManyLevel {
  readonly id: HowManyLevelId;
  readonly max: number;
}

export const HOW_MANY_LEVELS: readonly HowManyLevel[] = [
  { id: 'easy', max: 3 },
  { id: 'normal', max: 5 },
  { id: 'hard', max: 7 },
  { id: 'expert', max: 10 },
];

export const getHowManyLevel = (id: HowManyLevelId): HowManyLevel =>
  HOW_MANY_LEVELS.find((level) => level.id === id) ?? HOW_MANY_LEVELS[0];

/** Things to count: animals, fruit and toys kids know, each easy to tell apart */
export const COUNT_THINGS: readonly string[] = [
  '🐬',
  '🐟',
  '🦆',
  '🐢',
  '🐞',
  '🦋',
  '🐥',
  '🐙',
  '⭐',
  '🍎',
  '🍓',
  '🍌',
  '🎈',
  '🚗',
  '⚽',
  '🌸',
];

export const HOW_MANY_ROUNDS = 10;

/** One round: a thing shown `count` times */
export interface HowManyRound {
  readonly thing: string;
  readonly count: number;
}

/** The numbers a level asks for, from 1 */
export const answersFor = ({ max }: HowManyLevel): number[] => Array.from({ length: max }, (_, index) => index + 1);

/**
 * The rounds of a game: every count of the level comes up, never the same count or the same thing twice in a row,
 * so each round looks new
 */
export function howManyRounds(level: HowManyLevel, random: Random, rounds = HOW_MANY_ROUNDS): HowManyRound[] {
  const counts = answersFor(level);
  const result: HowManyRound[] = [];
  for (let index = 0; index < rounds; index++) {
    const previous = result[index - 1];
    const count = pick(
      counts.filter((candidate) => candidate !== previous?.count),
      random,
    );
    const thing = pick(
      COUNT_THINGS.filter((candidate) => candidate !== previous?.thing),
      random,
    );
    result.push({ thing, count });
  }
  return result;
}

/** A little tilt and lift for each thing, so a round looks scattered rather than lined up; the same every render */
export interface ThingPlace {
  readonly rotate: number;
  readonly lift: number;
  /** When it pops in, so the things appear one after another */
  readonly delayMs: number;
}

export function thingPlaces(count: number, random: Random): ThingPlace[] {
  return Array.from({ length: count }, (_, index) => ({
    rotate: Math.round((random() - 0.5) * 24),
    lift: Math.round((random() - 0.5) * 24),
    delayMs: index * 180,
  }));
}
