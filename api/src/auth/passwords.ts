import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/** scrypt settings: slow enough to make guessing passwords expensive, fast enough for a sign-in */
const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

/** Shortest password an admin may choose */
export const MIN_PASSWORD_LENGTH = 10;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: COST, r: BLOCK_SIZE, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key)),
    ),
  );
}

/** A password's hash to store, as `scrypt:<salt>:<hash>` in base64url */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return [
    'scrypt',
    salt.toString('base64url'),
    (await derive(password, salt)).toString('base64url'),
  ].join(':');
}

/** Whether a password matches a stored hash, compared in constant time */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(':');
  if (scheme !== 'scrypt' || !salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, 'base64url');
  const actual = await derive(password, Buffer.from(salt, 'base64url'));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

/** A new random session token for a cookie, and the hash kept in the database */
export function newSessionToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

/** A random password for a new admin, to change after signing in */
export const randomPassword = (): string =>
  randomBytes(12).toString('base64url');
