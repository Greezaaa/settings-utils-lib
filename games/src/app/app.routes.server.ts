import { RenderMode, ServerRoute } from '@angular/ssr';
import { ADMIN_INVITE_PATH } from './core/links';

export const serverRoutes: ServerRoute[] = [
  { path: `${ADMIN_INVITE_PATH}/:secret`, renderMode: RenderMode.Client },
  { path: 'r/:code', renderMode: RenderMode.Client },
  { path: 'account/reset/:secret', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
