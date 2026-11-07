import { Route, Routes } from '@angular/router';
import { GameSlug } from './core/games';
import { PREVIEW_MESSAGES, SITE_META, SITE_NAME } from './core/page-meta';

const { seo, home, games, privacy } = PREVIEW_MESSAGES;

/** Page title and description of a game, for search results and link previews */
function gameMeta(slug: GameSlug): Pick<Route, 'title' | 'data'> {
  const { name, subtitle, intro, summary } = games[slug];
  return { title: `${name}: ${subtitle} · ${SITE_NAME}`, data: { description: `${intro} ${summary}` } };
}

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
    ...gameMeta('math-games'),
    loadComponent: () => import('./pages/math-games/math-games-page').then((m) => m.MathGamesPage),
  },
  {
    path: 'letter-games',
    ...gameMeta('letter-games'),
    loadComponent: () => import('./pages/letter-games/letter-games-page').then((m) => m.LetterGamesPage),
  },
  {
    path: 'sliding-puzzle',
    ...gameMeta('sliding-puzzle'),
    loadComponent: () => import('./pages/sliding-puzzle/sliding-puzzle-page').then((m) => m.SlidingPuzzlePage),
  },
  {
    path: 'turn-picture',
    ...gameMeta('turn-picture'),
    loadComponent: () => import('./pages/turn-picture/turn-picture-page').then((m) => m.TurnPicturePage),
  },
  {
    path: 'place-pieces',
    ...gameMeta('place-pieces'),
    loadComponent: () => import('./pages/place-pieces/place-pieces-page').then((m) => m.PlacePiecesPage),
  },
  {
    path: 'privacy',
    title: `${privacy.title} · ${SITE_NAME}`,
    data: { description: privacy.lead },
    loadComponent: () => import('./pages/privacy/privacy-page').then((m) => m.PrivacyPage),
  },
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
