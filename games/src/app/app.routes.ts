import { Route, Routes } from '@angular/router';
import { PREVIEW_MESSAGES, SITE_META, SITE_NAME } from './core/page-meta';

const { seo, home, games } = PREVIEW_MESSAGES;

/** The not-found page: prerendered at /404 (copied to 404.html after the build) and shown for unknown links */
const notFound = {
  title: `${seo.notFoundTitle} · ${SITE_NAME}`,
  data: { description: seo.notFoundDescription, noIndex: true },
  loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
} satisfies Omit<Route, 'path'>;

export const routes: Routes = [
  {
    path: '',
    title: `${home.title} · ${SITE_NAME}`,
    data: SITE_META,
    loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'math-games',
    title: `${games['math-games'].name}: ${seo.mathGamesSubtitle} · ${SITE_NAME}`,
    data: { description: `${seo.mathGamesIntro} ${games['math-games'].summary}` },
    loadComponent: () => import('./pages/math-games/math-games-page').then((m) => m.MathGamesPage),
  },
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
