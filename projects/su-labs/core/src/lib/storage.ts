import { isBrowser } from './environment';

/**
 * Where a utility saves its value: the part of the Web Storage API the utilities use.
 * `localStorage` fits as is; `createSuCookieStorage()` shares values across subdomains.
 */
export interface SuStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Options of {@link createSuCookieStorage} */
export interface SuCookieStorageOptions {
  /**
   * Parent domain to share the values with, e.g. `'example.com'` for `example.com` and every subdomain.
   * Only used when the page is on that domain; anywhere else (such as `localhost`) the cookies belong to
   * the current host, so development keeps working.
   */
  domain?: string;
  /** Days before a saved value expires (default: 365) */
  maxAgeDays?: number;
}

const DEFAULT_MAX_AGE_DAYS = 365;
const SECONDS_PER_DAY = 24 * 60 * 60;

/** The browser's `localStorage`, or `null` outside a browser */
export function getSuLocalStorage(): SuStorage | null {
  return isBrowser() ? localStorage : null;
}

/**
 * A {@link SuStorage} that keeps values in cookies, so sites on the same parent domain can share them
 * (for example a theme picked on `example.com` also applies on `app.example.com`).
 * Cookies are sent with every request, so keep the values small: settings, not data.
 * Outside a browser it reads nothing and writes nothing.
 */
export function createSuCookieStorage(options: SuCookieStorageOptions = {}): SuStorage {
  const maxAge = Math.round((options.maxAgeDays ?? DEFAULT_MAX_AGE_DAYS) * SECONDS_PER_DAY);

  const write = (key: string, value: string, maxAgeSeconds: number): void => {
    if (!isBrowser()) {
      return;
    }
    const attributes = [`path=/`, `max-age=${maxAgeSeconds}`, 'SameSite=Lax'];
    const domain = cookieDomain(options.domain);
    if (domain) {
      attributes.push(`domain=${domain}`);
    }
    if (location.protocol === 'https:') {
      attributes.push('Secure');
    }
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; ${attributes.join('; ')}`;
  };

  return {
    getItem(key) {
      if (!isBrowser()) {
        return null;
      }
      const name = `${encodeURIComponent(key)}=`;
      const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(name));
      return cookie === undefined ? null : decodeURIComponent(cookie.slice(name.length));
    },
    setItem(key, value) {
      write(key, value, maxAge);
    },
    removeItem(key) {
      write(key, '', 0);
    },
  };
}

/** The domain to set, or `undefined` for a cookie of the current host only */
function cookieDomain(domain: string | undefined): string | undefined {
  if (!domain) {
    return undefined;
  }
  const host = location.hostname;
  return host === domain || host.endsWith(`.${domain}`) ? domain : undefined;
}
