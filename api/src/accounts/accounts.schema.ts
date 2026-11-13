import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '../auth/passwords.js';
import { gameSchema, isPlausibleResult, resultGameSchema } from '../shared/catalog.js';
import { screenNameSchema } from './screen-name.js';

export const loginNameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,30}$/);

export const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH).max(200);
const emailSchema = z.email().max(254).toLowerCase();

export const registerSchema = z.object({
  loginName: loginNameSchema,
  password: passwordSchema,
  screenName: screenNameSchema,
  email: emailSchema.optional(),
  showOnLeaderboard: z.boolean().default(false),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const signInSchema = z.object({
  loginName: z.string().trim().toLowerCase().min(3).max(254),
  password: z.string().min(1).max(200),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const changeSchema = z.object({
  screenName: screenNameSchema.optional(),
  email: emailSchema.nullable().optional(),
  password: z.string().min(1).max(200).optional(),
});
export type ChangeInput = z.infer<typeof changeSchema>;

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

export const resultSchema = resultShape.refine(isPlausibleResult, {
  message: 'implausible-result',
});
export type ResultInput = z.infer<typeof resultSchema>;

export const bestsSchema = z.object({
  bests: z
    .array(resultShape)
    .max(300)
    .transform((bests) => bests.filter(isPlausibleResult)),
});
