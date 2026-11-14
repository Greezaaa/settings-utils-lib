import { z } from 'zod';

export const list = z.string().transform((value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

export const optionalSecret = z
  .string()
  .optional()
  .transform((value) => value || undefined)
  .pipe(z.string().min(32).optional());

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  CORS_ORIGINS: list.default([
    'https://games.su-labs.dev',
    'https://su-labs.dev',
  ]),
  ADMIN_TOKEN: z.string().min(32),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  COOKIE_DOMAIN: z.string().min(1).optional(),
  ROOM_NAME_SECRET: optionalSecret,
  UPLOADS_DIR: z.string().default('/data/uploads'),
  TRUST_CLOUDFLARE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  SMTP_URL: z.url().optional(),
  MAIL_FROM: z.string().default('su-labs games <games@su-labs.dev>'),
  GAMES_URL: z.url().default('https://games.su-labs.dev'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
