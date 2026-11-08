import { RenderMode, ServerRoute } from '@angular/ssr';
import { ADMIN_INVITE_PATH } from './core/links';

/**
 * Every page is prerendered to static HTML at build time, so search engines and link
 * previews see real content and the site can be hosted as plain files (nginx on games.su-labs.dev).
 * Invite links are different every time, so their page is built in the browser from index.csr.html (nginx serves it
 * for the invite path); so are rooms (/r/<code>).
 */
export const serverRoutes: ServerRoute[] = [
  { path: `${ADMIN_INVITE_PATH}/:secret`, renderMode: RenderMode.Client },
  { path: 'r/:code', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
