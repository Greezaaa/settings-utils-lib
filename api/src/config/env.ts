import { z } from 'zod';

/** Splits a comma-separated list, e.g. `https://a.dev,https://b.dev` */
export const list = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

/**
 * Every setting the API reads from its environment (the server's .env file; see .env.example), checked when it
 * starts so a missing or wrong value stops it straight away instead of failing later.
 */
export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  /** e.g. postgres://su_labs:secret@db:5432/su_labs */
  DATABASE_URL: z.url(),
  /** Sites allowed to call the API from a browser */
  CORS_ORIGINS: list.default([
    'https://games.su-labs.dev',
    'https://su-labs.dev',
  ]),
  /**
   * Backup key for the moderation endpoints (/admin/…) for scripts, sent as `Authorization: Bearer <token>`; people
   * sign in with their own admin account instead (see `npm run create-admin`)
   */
  ADMIN_TOKEN: z.string().min(32),
  /** Send the sign-in cookie over HTTPS only; turn off just for the local API on http://localhost */
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  /** Folder where suggestion images are kept (a Docker volume on the server) */
  UPLOADS_DIR: z.string().default('/data/uploads'),
  /** Cloudflare Turnstile secret key; when set, suggestions need a Turnstile token */
  TURNSTILE_SECRET: z.string().optional(),
  /**
   * Requests come through the Cloudflare Tunnel, which puts the visitor's address in CF-Connecting-IP.
   * Only trust it when the API can't be reached any other way (it listens on 127.0.0.1 on the server).
   */
  TRUST_CLOUDFLARE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  /**
   * Mail server for players' password-reset emails, e.g. `smtps://user:password@smtp.example.com:465`. Without it,
   * accounts have no email (and a forgotten password can't be reset)
   */
  SMTP_URL: z.url().optional(),
  /** Who the emails come from, e.g. `su-labs games <games@su-labs.dev>` */
  MAIL_FROM: z.string().default('su-labs games <games@su-labs.dev>'),
  /** The games site, for links in emails */
  GAMES_URL: z.url().default('https://games.su-labs.dev'),
});

export type Env = z.infer<typeof envSchema>;

/** For ConfigModule: checks the environment and returns it typed, or throws listing what is wrong */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
