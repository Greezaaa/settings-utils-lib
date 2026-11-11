import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../config/env.js';

/** The cookie that keeps an admin signed in; HttpOnly, so the page's scripts can't read it */
export const SESSION_COOKIE = 'su_labs_admin';
/** The cookie that keeps a player signed in to their account */
export const PLAYER_COOKIE = 'su_labs_player';

/**
 * A cookie's value from a request, if any; a badly encoded one counts as none, so it can't turn a 401 into a 500.
 * When the browser sends two of the same name (an old one kept for api.su-labs.dev only, and the newer one for all of
 * su-labs.dev), the last wins: browsers send older cookies first.
 */
export function readCookie(request: Request, name: string): string | null {
  let found: string | null = null;
  for (const part of (request.headers.cookie ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name && value.length > 0) {
      try {
        found = decodeURIComponent(value.join('='));
      } catch {
        found = null;
      }
    }
  }
  return found;
}

/** The admin session token from a request's cookies, if any */
export const sessionToken = (request: Request): string | null =>
  readCookie(request, SESSION_COOKIE);

/** Where session cookies go: HTTPS only when `secure`, and to every subdomain of `domain` when there is one */
export interface CookieSettings {
  readonly secure: boolean;
  readonly domain: string | undefined;
}

/** The cookie settings from the environment (COOKIE_SECURE, COOKIE_DOMAIN) */
export const cookieSettings = (
  config: ConfigService<Env, true>,
): CookieSettings => ({
  secure: config.get('COOKIE_SECURE', { infer: true }),
  domain: config.get('COOKIE_DOMAIN', { infer: true }),
});

/**
 * Cookie options: never readable by scripts, and only over HTTPS when `secure` (always in production; off for the
 * local services on http://localhost). auth.su-labs.dev sets them for all of su-labs.dev (`domain`), so
 * api.su-labs.dev gets them too; SameSite=Lax still lets games.su-labs.dev send them, as all are on su-labs.dev.
 */
const cookieOptions = ({ secure, domain }: CookieSettings): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
  ...(domain ? { domain } : {}),
});

/** Sets a session cookie (`name` is SESSION_COOKIE or PLAYER_COOKIE) */
export function setSessionCookie(
  response: Response,
  token: string,
  expires: Date,
  settings: CookieSettings,
  name = SESSION_COOKIE,
): void {
  response.cookie(name, token, { ...cookieOptions(settings), expires });
}

export function clearSessionCookie(
  response: Response,
  settings: CookieSettings,
  name = SESSION_COOKIE,
): void {
  response.clearCookie(name, cookieOptions(settings));
}
