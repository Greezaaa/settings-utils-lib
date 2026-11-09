/** Public address of the games site, without a trailing slash (also used in index.html and robots.txt) */
export const SITE_URL = 'https://games.su-labs.dev';

/** Image shown when a page is shared (1200x630, in games/public) */
export const SITE_PREVIEW_IMAGE_URL = `${SITE_URL}/og-image.png`;

/** Size and type of the preview image, declared so chat apps render it without probing the file (its alt text is translated) */
export const SITE_PREVIEW_IMAGE = {
  width: '1200',
  height: '630',
  type: 'image/png',
} as const;

/** How to reach the author */
export const AUTHOR_EMAIL_URL = 'mailto:yev.alekseyev@gmail.com';

/**
 * The admin team's pages, kept off the obvious /admin and /login that scanners try first (change it here only; nginx's
 * invite location in deploy/nginx/games.su-labs.dev.conf must match). Obscurity is only a first fence: the API checks
 * every sign-in and request.
 */
export const ADMIN_PATH = 'crew';
/** Invite links for new moderators: /<ADMIN_PATH>/invite/<secret> */
export const ADMIN_INVITE_PATH = `${ADMIN_PATH}/invite`;
