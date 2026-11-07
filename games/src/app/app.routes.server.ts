import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Every page is prerendered to static HTML at build time, so search engines and link
 * previews see real content and the site can be hosted as plain files (nginx on games.su-labs.dev).
 */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
