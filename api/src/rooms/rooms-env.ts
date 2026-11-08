import { z } from 'zod';
import { list } from '../config/env.js';

/**
 * Settings of the rooms service (rooms.su-labs.dev), from the same .env as the API: it needs no database or secrets,
 * only who may connect and how to tell visitors apart for the limits.
 */
export const roomsEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  /** Sites allowed to open a room connection from a browser */
  CORS_ORIGINS: list.default(['https://games.su-labs.dev']),
  /** Requests come through the Cloudflare Tunnel; trust its visitor address header (see the API's env.ts) */
  TRUST_CLOUDFLARE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type RoomsEnv = z.infer<typeof roomsEnvSchema>;

export function validateRoomsEnv(config: Record<string, unknown>): RoomsEnv {
  const result = roomsEnvSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
