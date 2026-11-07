import type { CookieOptions, Request, Response } from 'express';

/** The cookie that keeps an admin signed in; HttpOnly, so the page's scripts can't read it */
export const SESSION_COOKIE = 'su_labs_admin';

/** The session token from a request's cookies, if any */
export function sessionToken(request: Request): string | null {
  for (const part of (request.headers.cookie ?? '').split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name === SESSION_COOKIE && value.length > 0) {
      return decodeURIComponent(value.join('='));
    }
  }
  return null;
}

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

export function setSessionCookie(
  response: Response,
  token: string,
  expires: Date,
  secure: boolean,
): void {
  response.cookie(SESSION_COOKIE, token, { ...cookieOptions(secure), expires });
}

export function clearSessionCookie(response: Response, secure: boolean): void {
  response.clearCookie(SESSION_COOKIE, cookieOptions(secure));
}
