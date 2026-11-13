export const SITE_URL = 'https://games.su-labs.dev';

export const SITE_PREVIEW_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const SITE_PREVIEW_IMAGE = {
  width: '1200',
  height: '630',
  type: 'image/png',
} as const;

export const AUTHOR_NAME = 'Yevheniy Alekseyev';
export const AUTHOR_EMAIL_URL = 'mailto:yev.alekseyev@gmail.com';

/** Keep in sync with the admin and invite locations in deploy/nginx/games.su-labs.dev.conf */
export const ADMIN_PATH = 'crew';
export const ADMIN_INVITE_PATH = `${ADMIN_PATH}/invite`;
