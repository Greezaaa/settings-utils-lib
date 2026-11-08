import { z } from 'zod';

/**
 * The games and languages of games.su-labs.dev, so the API only counts and stores known values.
 * Keep in sync with games/src/app/core/games.ts, core/features.ts and i18n/site-messages.ts (catalog.spec.ts checks).
 */
export const GAME_SLUGS = [
  'math-games',
  'letter-games',
  'hit-the-note',
  'sliding-puzzle',
  'turn-picture',
  'place-pieces',
] as const;
export const LANGUAGE_IDS = ['en', 'es', 'eu', 'uk'] as const;
/** Features the admin switches on or off for the public (games/src/app/core/features.ts) */
export const FEATURE_IDS = ['rooms'] as const;

export type GameSlug = (typeof GAME_SLUGS)[number];
export type LanguageId = (typeof LANGUAGE_IDS)[number];
export type FeatureId = (typeof FEATURE_IDS)[number];

export const gameSchema = z.enum(GAME_SLUGS);
export const languageSchema = z.enum(LANGUAGE_IDS);
export const featureSchema = z.enum(FEATURE_IDS);
