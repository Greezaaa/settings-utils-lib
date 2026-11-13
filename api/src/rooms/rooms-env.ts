import { z } from 'zod';
import { list, optionalSecret } from '../config/env.js';

export const roomsEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: list.default(['https://games.su-labs.dev']),
  ROOM_NAME_SECRET: optionalSecret,
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
