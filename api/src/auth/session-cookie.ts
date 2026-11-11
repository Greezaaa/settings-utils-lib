import type { CookieOptions, Request, Response } from 'express';

/** The cookie that keeps an admin signed in; HttpOnly, so the page's scripts can't read it */
export const SESSION_COOKIE = 'su_labs_admin';
/** The cookie that keeps a player signed in to their account */
export const PLAYER_COOKIE = 'su_labs_player';

/** A cookie's value from a request, if any; a badly encoded one counts as none, so it can't turn a 401 into a 500 */
export function readCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.cookie ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name && value.length > 0) {
      try {
        return decodeURIComponent(value.join('='));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** The admin session token from a request's cookies, if any */
export const sessionToken = (request: Request): string | null =>
  readCookie(request, SESSION_COOKIE);

/**
 * Cookie settings: sent only to the API, never readable by scripts, and only over HTTPS when `secure` (always in
 * production; off for the local API on http://localhost). SameSite=Lax still lets games.su-labs.dev send it to
 * api.su-labs.dev, as both are on su-labs.dev.
 */
const cookieOptions = (secure: boolean): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
});

/** Sets a session cookie (`name` is SESSION_COOKIE or PLAYER_COOKIE) */
export function setSessionCookie(
  response: Response,
  token: string,
  expires: Date,
  secure: boolean,
  name = SESSION_COOKIE,
): void {
  response.cookie(name, token, { ...cookieOptions(secure), expires });
}

export function clearSessionCookie(
  response: Response,
  secure: boolean,
  name = SESSION_COOKIE,
): void {
  response.clearCookie(name, cookieOptions(secure));
}
