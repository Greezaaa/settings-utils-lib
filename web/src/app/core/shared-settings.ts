import { createSuCookieStorage, SuStorage } from '@su-labs/core';
import { isSavingAllowed } from './site-storage';

const cookies = createSuCookieStorage({ domain: 'su-labs.dev' });

/** The shared cookies, read and written only while the visitor allows saving (see site-storage.ts) */
const consentedCookies: SuStorage = {
  getItem: (key) => (isSavingAllowed() ? cookies.getItem(key) : null),
  setItem: (key, value) => {
    if (isSavingAllowed()) {
      cookies.setItem(key, value);
    }
  },
  removeItem: (key) => cookies.removeItem(key),
};

/**
 * Settings shared by su-labs.dev and games.su-labs.dev: theme and text size are saved in cookies on the
 * parent domain, so a choice made on one site also applies on the other. Both sites must use these
 * same keys, which the inline script in index.html reads too.
 */
export const SHARED_SETTINGS = {
  storage: consentedCookies,
  themeKey: 'su-labs:theme',
  fontSizeKey: 'su-labs:font-size',
} as const;

/** Deletes the shared cookies, when the visitor turns saving off or deletes what was saved */
export function forgetSharedSettings(): void {
  cookies.removeItem(SHARED_SETTINGS.themeKey);
  cookies.removeItem(SHARED_SETTINGS.fontSizeKey);
}
