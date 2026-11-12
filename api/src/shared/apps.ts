import { z } from 'zod';

/**
 * The apps whose players sign in on auth.su-labs.dev. Each app has its own accounts: the same login name, screen name
 * or email can be used once in every app, and signing in to one never signs in to another. Add an app here (e.g.
 * spotea) to give it accounts; the admin team is shared by all apps.
 */
export const APP_IDS = ['games'] as const;
export type AppId = (typeof APP_IDS)[number];
export const appSchema = z.enum(APP_IDS);

export const isAppId = (value: unknown): value is AppId =>
  appSchema.safeParse(value).success;

/** The app api.su-labs.dev serves: its account data and leaderboards are the games' */
export const API_APP: AppId = 'games';

/** The cookie that keeps a player signed in to one app, e.g. `su_labs_games_player` */
export const playerCookie = (app: AppId): string => `su_labs_${app}_player`;
