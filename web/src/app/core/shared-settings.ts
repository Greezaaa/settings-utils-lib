import { createSuCookieStorage, SuStorage } from '@su-labs/core';
import { isSavingAllowed } from './site-storage';

const cookies = createSuCookieStorage({ domain: 'su-labs.dev' });

const consentedCookies: SuStorage = {
  getItem: (key) => (isSavingAllowed() ? cookies.getItem(key) : null),
  setItem: (key, value) => {
    if (isSavingAllowed()) {
      cookies.setItem(key, value);
    }
  },
  removeItem: (key) => cookies.removeItem(key),
};

export const SHARED_SETTINGS = {
  storage: consentedCookies,
  themeKey: 'su-labs:theme',
  fontSizeKey: 'su-labs:font-size',
} as const;

export function forgetSharedSettings(): void {
  cookies.removeItem(SHARED_SETTINGS.themeKey);
  cookies.removeItem(SHARED_SETTINGS.fontSizeKey);
}
