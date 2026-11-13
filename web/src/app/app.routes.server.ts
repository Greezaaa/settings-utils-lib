import { RenderMode, ServerRoute } from '@angular/ssr';
import { ALL_PACKAGES } from './core/packages';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'changelog/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => ALL_PACKAGES.map(({ slug }) => ({ slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
