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
] as const;
export const LANGUAGE_IDS = ['en', 'es', 'eu', 'uk'] as const;
/**
 * Features the admin switches on or off for the public (games/src/app/core/features.ts): rooms, and each game in rooms
 * on its own (`rooms-<game>`), apart from the game's single-player switch, and
 * settings like answers in words (`answer-words`)
 */
export const FEATURE_IDS = [
  'rooms',
  'rooms-math-games',
  'rooms-measure-it',
  'rooms-letter-games',
  'rooms-sliding-puzzle',
  'rooms-turn-picture',
  'rooms-place-pieces',
  'answer-words',
  'category-menu',
  'accounts',
  'leaderboard',
] as const;

export type GameSlug = (typeof GAME_SLUGS)[number];

/** Games that keep players' best results, for accounts and the leaderboard */
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
export type LanguageId = (typeof LANGUAGE_IDS)[number];
export type FeatureId = (typeof FEATURE_IDS)[number];

export const gameSchema = z.enum(GAME_SLUGS);
export const languageSchema = z.enum(LANGUAGE_IDS);
export const featureSchema = z.enum(FEATURE_IDS);
