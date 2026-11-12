import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

/** How long a name pass works: long enough to create or join a room, short enough that a name taken away stops soon */
export const NAME_PASS_MS = 10 * 60_000;

const namePassBodySchema = z.object({ name: z.string(), expires: z.number() });
type NamePassBody = z.infer<typeof namePassBodySchema>;

const encode = (value: string): string =>
  Buffer.from(value).toString('base64url');
const signature = (body: string, secret: string): string =>
  createHmac('sha256', secret).update(body).digest('base64url');

/**
 * A pass the API gives a signed-in player whose screen name a moderator approved, for the rooms service to show that
 * name: the name and when the pass stops working, signed with a secret both services share. The rooms service keeps no
 * accounts or database, so this is how it knows a name is allowed without trusting what a browser says.
 */
export function signNamePass(
  name: string,
  secret: string,
  now = Date.now(),
): string {
  const body = encode(
    JSON.stringify({
      name,
      expires: now + NAME_PASS_MS,
    } satisfies NamePassBody),
  );
  return `${body}.${signature(body, secret)}`;
}

/** The approved name in a pass, or null when it is forged, changed or expired */
export function verifyNamePass(
  pass: string,
  secret: string,
  now = Date.now(),
): string | null {
  const [body, signed, ...rest] = pass.split('.');
  if (!body || !signed || rest.length > 0) {
    return null;
  }
  const expected = Buffer.from(signature(body, secret));
  const given = Buffer.from(signed);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  try {
    const parsed = namePassBodySchema.safeParse(
      JSON.parse(Buffer.from(body, 'base64url').toString()),
    );
    return parsed.success && parsed.data.expires > now
      ? parsed.data.name
      : null;
  } catch {
    return null;
  }
}
