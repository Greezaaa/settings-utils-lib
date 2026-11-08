/** The API of the games site (api/ in this repository) */
export const API_URL = 'https://api.su-labs.dev';
/** The API run locally (`npm run start:dev` in api/), used while the site itself runs on localhost */
const LOCAL_API_URL = 'http://localhost:3000';

/** How long to wait for the API before going on without it (it can be slow or blocked) */
export const READ_TIMEOUT_MS = 4000;
export const SEND_TIMEOUT_MS = 15000;

/** The API address for a path: the local API while the site runs on localhost, so testing never touches real data */
export function apiUrl(document: Document, path: string): string {
  return `${document.location.hostname === 'localhost' ? LOCAL_API_URL : API_URL}${path}`;
}

/** A property of a value read from JSON, or undefined; for checking API answers without trusting their shape */
export function field(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
}

/** A request with a JSON body */
export const jsonInit = (method: string, body: object): RequestInit => ({
  method,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

/**
 * A request to the API that carries its HttpOnly cookies (the admin's or the player's session), or null when the API
 * can't be reached in time
 */
export async function credentialedFetch(
  document: Document,
  path: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response | null> {
  try {
    return await fetch(apiUrl(document, path), { ...init, credentials: 'include', signal: AbortSignal.timeout(timeoutMs) });
  } catch {
    return null;
  }
}
