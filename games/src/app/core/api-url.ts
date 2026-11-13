export type ApiService = 'api' | 'auth';
export const API_URL = 'https://api.su-labs.dev';
const SERVICE_URLS: Readonly<Record<ApiService, string>> = { api: API_URL, auth: 'https://auth.su-labs.dev' };
const LOCAL_SERVICE_URLS: Readonly<Record<ApiService, string>> = {
  api: 'http://localhost:3000',
  auth: 'http://localhost:3333',
};

export const READ_TIMEOUT_MS = 4000;
export const SEND_TIMEOUT_MS = 15000;

export function apiUrl(document: Document, path: string, service: ApiService = 'api'): string {
  const urls = document.location.hostname === 'localhost' ? LOCAL_SERVICE_URLS : SERVICE_URLS;
  return `${urls[service]}${path}`;
}

export function field(value: unknown, key: string): unknown {
  return typeof value === 'object' && value !== null ? Reflect.get(value, key) : undefined;
}

export const jsonInit = (method: string, body: object): RequestInit => ({
  method,
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

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
