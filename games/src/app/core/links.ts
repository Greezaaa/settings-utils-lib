/** Public address of the games site, without a trailing slash (also used in index.html and robots.txt) */
export const SITE_URL = 'https://games.su-labs.dev';

/** Image shown when a page is shared (1200x630, in games/public) */
export const SITE_PREVIEW_IMAGE_URL = `${SITE_URL}/og-image.png`;

/** Size, type and description of the preview image, declared so chat apps render it without probing the file */
export const SITE_PREVIEW_IMAGE = {
  width: '1200',
  height: '630',
  type: 'image/png',
  alt: 'su-labs games: free games for kids',
} as const;

/** The main su-labs site, linked from the header and footer */
export const MAIN_SITE_URL = 'https://su-labs.dev/';

/** How to reach the author */
export const AUTHOR_EMAIL_URL = 'mailto:yev.alekseyev@gmail.com';

/** GitHub repository that hosts the games and the libraries they run on */
export const GITHUB_REPO_URL = 'https://github.com/Greezaaa/settings-utils-lib';
