import { z } from 'zod';
import { languageSchema } from '../shared/catalog.js';
import { CODE_ALPHABET, CODE_LENGTH, PLAYER_GENDERS, REACTIONS, ROOM_GAMES, ROUND_SECONDS } from './room.js';

const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`));
const gameIdSchema = z.string().regex(/^[a-z-]{1,30}$/);

const genderSchema = z.enum(PLAYER_GENDERS).nullable().default(null);

const namePassSchema = z.string().max(1000).nullable().default(null);

export const createSchema = z.object({
  language: languageSchema,
  gender: genderSchema,
  namePass: namePassSchema,
});
export const joinSchema = z.object({
  code: codeSchema,
  gender: genderSchema,
  namePass: namePassSchema,
});
export const rejoinSchema = z.object({
  code: codeSchema,
  token: z.string().regex(/^[a-z0-9]{32}$/),
});
export const settingsSchema = z.object({
  game: z.enum(ROOM_GAMES),
  mode: gameIdSchema,
  level: gameIdSchema,
  seconds: z.union(ROUND_SECONDS.map((seconds) => z.literal(seconds))),
  language: languageSchema,
  showScores: z.boolean().default(true),
  ownNames: z.boolean().default(false),
});
export const readySchema = z.object({ ready: z.boolean() });
export const scoreSchema = z.object({
  score: z.number().int().min(0).max(10_000),
});
export const reactSchema = z.object({ reaction: z.enum(REACTIONS) });
const playerIdSchema = z.string().regex(/^[a-z0-9]{12}$/);
export const kickSchema = z.object({ playerId: playerIdSchema });
export const hideNameSchema = z.object({ playerId: playerIdSchema });

export type ServerEvent =
  | 'joined'
  | 'room'
  | 'error'
  | 'kicked'
  | 'left'
  | 'reaction';
