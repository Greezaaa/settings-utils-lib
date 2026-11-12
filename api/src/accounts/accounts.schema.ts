import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '../auth/passwords.js';
import {
  gameSchema,
  isPlausibleResult,
  resultGameSchema,
} from '../shared/catalog.js';

/** Sign-in: 3 to 30 letters, digits, dots, dashes or underscores; compared lowercase */
export const loginNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,30}$/);

/**
 * The leaderboard's name: 3 to 20 letters (any alphabet), digits, spaces, dots, dashes or underscores, with single
 * spaces inside
 */
export const screenNameSchema = z
  .string()
  .trim()
  .transform((name) => name.replace(/\s+/g, ' '))
  .pipe(z.string().regex(/^[\p{L}\p{N} ._-]{3,20}$/u));

export const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH).max(200);
const emailSchema = z.email().max(254).toLowerCase();

export const registerSchema = z.object({
  loginName: loginNameSchema,
  password: passwordSchema,
  screenName: screenNameSchema,
  email: emailSchema.optional(),
  /** Whether the player appears on the leaderboards; off unless they choose it */
  showOnLeaderboard: z.boolean().default(false),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  loginName: z.string().trim().toLowerCase().min(3).max(254),
  password: z.string().min(1).max(200),
});
export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Changes to the account: a new screen name, an email (null removes it; changing it needs the password), or whether the
 * player appears on the leaderboards
 */
export const changeSchema = z.object({
  screenName: screenNameSchema.optional(),
  email: emailSchema.nullable().optional(),
  password: z.string().min(1).max(200).optional(),
});
export type ChangeInput = z.infer<typeof changeSchema>;

/** Whether the player appears on the leaderboards: a switch, so it has its own, more relaxed limit */
export const leaderboardChoiceSchema = z.object({ show: z.boolean() });

export const changePasswordSchema = z.object({
  current: z.string().min(1).max(200),
  next: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({ password: passwordSchema });
export const secretSchema = z.string().regex(/^[\w-]{20,100}$/);
export const deleteSchema = z.object({ password: z.string().min(1).max(200) });

export const favoritesSchema = z.object({
  games: z.array(gameSchema).max(50),
});

/** A game's settings, as the games site names them, e.g. `which-one:normal` */
const resultKeySchema = z
  .string()
  .regex(/^[a-z0-9-]{1,20}(:[a-z0-9-]{1,20}){0,3}$/)
  .max(60);
const resultValueSchema = z.number().int().min(0).max(100_000);

const resultShape = z.object({
  game: resultGameSchema,
  key: resultKeySchema,
  value: resultValueSchema,
});

/** A finished game; a result the game can't give is refused */
export const resultSchema = resultShape.refine(isPlausibleResult, {
  message: 'implausible-result',
});
export type ResultInput = z.infer<typeof resultSchema>;

/**
 * Best results the browser kept before signing in, to add to the account; ones the game can't give are left out
 * quietly, so one odd value kept in a browser doesn't stop the others
 */
export const bestsSchema = z.object({
  bests: z
    .array(resultShape)
    .max(300)
    .transform((bests) => bests.filter(isPlausibleResult)),
});
