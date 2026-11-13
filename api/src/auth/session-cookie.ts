import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../config/env.js';

export const SESSION_COOKIE = 'su_labs_admin';

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

export const sessionToken = (request: Request): string | null =>
  readCookie(request, SESSION_COOKIE);

export interface CookieSettings {
  readonly secure: boolean;
  readonly domain: string | undefined;
}

export const cookieSettings = (
  config: ConfigService<Env, true>,
): CookieSettings => ({
  secure: config.get('COOKIE_SECURE', { infer: true }),
  domain: config.get('COOKIE_DOMAIN', { infer: true }),
});

const cookieOptions = ({ secure, domain }: CookieSettings): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/',
  ...(domain ? { domain } : {}),
});

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
