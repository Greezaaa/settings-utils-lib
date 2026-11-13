import { z } from 'zod';

export const APP_IDS = ['games'] as const;
export type AppId = (typeof APP_IDS)[number];
export const appSchema = z.enum(APP_IDS);

export const isAppId = (value: unknown): value is AppId =>
  appSchema.safeParse(value).success;

export const API_APP: AppId = 'games';

export const playerCookie = (app: AppId): string => `su_labs_${app}_player`;
