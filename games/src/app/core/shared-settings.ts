import { createSuCookieStorage } from '@su-labs/core';

/**
 * Settings shared by su-labs.dev and games.su-labs.dev: theme and text size are saved in cookies on the
 * parent domain, so a choice made on one site also applies on the other. Both sites must use these
 * same keys, which the inline script in index.html reads too.
 */
export const SHARED_SETTINGS = {
  storage: createSuCookieStorage({ domain: 'su-labs.dev' }),
  themeKey: 'su-labs:theme',
  fontSizeKey: 'su-labs:font-size',
} as const;
