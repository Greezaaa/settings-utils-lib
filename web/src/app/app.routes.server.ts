import { RenderMode, ServerRoute } from '@angular/ssr';
import { ALL_PACKAGES } from './core/packages';

/**
 * Every page is prerendered to static HTML at build time, so search engines and link
 * previews see real content and the site can be hosted as plain files (nginx on su-labs.dev).
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'changelog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ALL_PACKAGES.map(({ slug }) => ({ slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
