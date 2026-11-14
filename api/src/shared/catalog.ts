import { z } from 'zod';

/**
 * The games and languages of games.su-labs.dev, so the API only counts and stores known values.
 * Keep in sync with games/src/app/core/games.ts, core/features.ts and i18n/site-messages.ts (catalog.spec.ts checks).
 */
export const GAME_SLUGS = [
  'math-games',
  'measure-it',
  'climb-tower',
  'letter-games',
  'hit-the-note',
  'sliding-puzzle',
  'turn-picture',
  'place-pieces',
  'find-pairs',
  'how-many',
  'letter-sudoku',
  'number-sudoku',
  'word-search',
  'secret-word',
] as const;
export const UPDATE_KINDS = ['game', 'language', 'settings', 'feature', 'privacy'] as const;
export type UpdateKind = (typeof UPDATE_KINDS)[number];
export const GAME_CATEGORIES = ['numbers', 'letters', 'music', 'puzzles'] as const;
export type GameCategory = (typeof GAME_CATEGORIES)[number];
export const LANGUAGE_IDS = ['en', 'es', 'eu', 'it', 'uk'] as const;
export const FEATURE_IDS = [
  'rooms',
  'rooms-math-games',
  'rooms-measure-it',
  'rooms-letter-games',
  'rooms-sliding-puzzle',
  'rooms-turn-picture',
  'rooms-place-pieces',
  'answer-words',
  'word-gender',
  'menu-ring',
  'category-menu',
  'accounts',
  'leaderboard',
  'lively-fields',
  'colours-page',
  'room-rename',
  'public-leaderboard',
  'how-many-sound',
  'room-reactions',
  'room-names',
  'sticker-drag',
  'offline',
  'install-app',
  'fullscreen',
] as const;

export type GameSlug = (typeof GAME_SLUGS)[number];

export const RESULT_GAME_SLUGS = [
  'math-games',
  'climb-tower',
  'find-pairs',
  'sliding-puzzle',
  'turn-picture',
  'place-pieces',
] as const satisfies readonly GameSlug[];
export type ResultGame = (typeof RESULT_GAME_SLUGS)[number];
export const resultGameSchema = z.enum(RESULT_GAME_SLUGS);

/**
 * Which way a game's result is better: a higher score, or fewer moves or seconds. Keep in sync with RESULT_GAMES in
 * games/src/app/core/player-results.ts.
 */
export const RESULT_DIRECTIONS: Readonly<
  Record<ResultGame, 'higher' | 'lower'>
> = {
  'math-games': 'higher',
  'climb-tower': 'higher',
  'find-pairs': 'lower',
  'sliding-puzzle': 'lower',
  'turn-picture': 'lower',
  'place-pieces': 'lower',
};

/**
 * The results a game can really give, so a made-up score can't top the leaderboards: the most points or floors, the
 * fewest moves or seconds. Find the pairs needs at least one move per pair of its board (by level). Keep in sync with
 * the games (games/src/app/games/).
 */
const PAIRS_PER_LEVEL: Readonly<Record<string, number>> = {
  easy: 6,
  normal: 12,
  hard: 15,
  expert: 18,
};
const RESULT_LIMITS: Readonly<
  Record<
    ResultGame,
    { readonly min: (key: string) => number; readonly max: number }
  >
> = {
  'math-games': { min: () => 0, max: 1000 },
  'climb-tower': { min: () => 0, max: 1000 },
  'find-pairs': { min: (key) => PAIRS_PER_LEVEL[key] ?? 6, max: 10_000 },
  'sliding-puzzle': { min: () => 1, max: 100_000 },
  'turn-picture': { min: () => 2, max: 100_000 },
  'place-pieces': { min: () => 2, max: 100_000 },
};

export function isPlausibleResult({
  game,
  key,
  value,
}: {
  readonly game: ResultGame;
  readonly key: string;
  readonly value: number;
}): boolean {
  const { min, max } = RESULT_LIMITS[game];
  return value >= min(key) && value <= max;
}
export type LanguageId = (typeof LANGUAGE_IDS)[number];
export type FeatureId = (typeof FEATURE_IDS)[number];

export const gameSchema = z.enum(GAME_SLUGS);
export const categorySchema = z.enum(GAME_CATEGORIES);
export const updateKindSchema = z.enum(UPDATE_KINDS);
export const languageSchema = z.enum(LANGUAGE_IDS);
export const featureSchema = z.enum(FEATURE_IDS);
