/**
 * The services of the games site (api/ in this repository): the API, and the auth service where the admin team and
 * players sign in (it sets the session cookies the API reads)
 */
export type ApiService = 'api' | 'auth';
export const API_URL = 'https://api.su-labs.dev';
const SERVICE_URLS: Readonly<Record<ApiService, string>> = { api: API_URL, auth: 'https://auth.su-labs.dev' };
/** The services run locally (`npm run start:dev` and `npm run start:auth` in api/), used while the site runs on localhost */
const LOCAL_SERVICE_URLS: Readonly<Record<ApiService, string>> = {
  api: 'http://localhost:3000',
  auth: 'http://localhost:3333',
};

/** How long to wait for the API before going on without it (it can be slow or blocked) */
export const READ_TIMEOUT_MS = 4000;
export const SEND_TIMEOUT_MS = 15000;

/** A service's address for a path: the local one while the site runs on localhost, so testing never touches real data */
export function apiUrl(document: Document, path: string, service: ApiService = 'api'): string {
  const urls = document.location.hostname === 'localhost' ? LOCAL_SERVICE_URLS : SERVICE_URLS;
  return `${urls[service]}${path}`;
}

/** A property of a value read from JSON, or undefined; for checking API answers without trusting their shape */
export function field(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
}

export const jsonInit = (method: string, body: object): RequestInit => ({
  method,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

/**
 * A request to a service that carries its HttpOnly cookies (the admin's or the player's session), or null when the
 * service can't be reached in time
 */
export async function credentialedFetch(
  document: Document,
  path: string,
  init: RequestInit,
  timeoutMs: number,
  service: ApiService = 'api',
): Promise<Response | null> {
  try {
    return await fetch(apiUrl(document, path, service), { ...init, credentials: 'include', signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    return null;
  }
}
