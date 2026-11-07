import { Route, Routes } from '@angular/router';
import { MATH_GAMES } from './core/games';
import { SITE_META, SITE_NAME } from './core/page-meta';

/** The not-found page: prerendered at /404 (copied to 404.html after the build) and shown for unknown links */
const notFound = {
  title: `Page not found · ${SITE_NAME}`,
  data: { description: 'This page doesn’t exist.', noIndex: true },
  loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
} satisfies Omit<Route, 'path'>;

export const routes: Routes = [
  {
    path: '',
    title: `${SITE_NAME}: free games for kids`,
    data: SITE_META,
    loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage),
  },
  {
    path: MATH_GAMES.slug,
    title: `${MATH_GAMES.name}: true or false, number pad and missing signs · ${SITE_NAME}`,
    data: { description: `A math game for kids. ${MATH_GAMES.summary}` },
    loadComponent: () => import('./pages/math-games/math-games-page').then((m) => m.MathGamesPage),
  },
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
