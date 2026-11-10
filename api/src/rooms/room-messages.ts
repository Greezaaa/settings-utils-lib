import { z } from 'zod';
import { languageSchema } from '../shared/catalog.js';
import {
  CODE_ALPHABET,
  CODE_LENGTH,
  PLAYER_GENDERS,
  ROOM_GAMES,
  ROUND_SECONDS,
} from './room.js';

/**
 * What players send to the rooms service, as `{ event, data }` JSON over the WebSocket; every message is checked here
 * before it touches a room. Nothing typed by a player is ever passed on: no names, no chat.
 */
const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`));
/** A game's own ids (math: answer style and level); the games site checks them against its games */
const gameIdSchema = z.string().regex(/^[a-z-]{1,30}$/);

/** The player's choice to be spoken to as a boy or a girl, when they made one */
const genderSchema = z.enum(PLAYER_GENDERS).nullable().default(null);

export const createSchema = z.object({
  language: languageSchema,
  gender: genderSchema,
});
export const joinSchema = z.object({ code: codeSchema, gender: genderSchema });
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
});
export const readySchema = z.object({ ready: z.boolean() });
export const scoreSchema = z.object({
  score: z.number().int().min(0).max(10_000),
});
export const kickSchema = z.object({
  playerId: z.string().regex(/^[a-z0-9]{12}$/),
});

/** What the rooms service sends back */
export type ServerEvent = 'joined' | 'room' | 'error' | 'kicked' | 'left';
