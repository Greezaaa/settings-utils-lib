import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const NAME_PASS_MS = 10 * 60_000;

const namePassBodySchema = z.object({ name: z.string(), expires: z.number() });
type NamePassBody = z.infer<typeof namePassBodySchema>;

const encode = (value: string): string =>
  Buffer.from(value).toString('base64url');
const signature = (body: string, secret: string): string =>
  createHmac('sha256', secret).update(body).digest('base64url');

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
