import { Route, Routes } from '@angular/router';
import { gameAvailableGuard } from './core/game-guard';
import { GameSlug } from './core/games';
import { ADMIN_INVITE_PATH, ADMIN_PATH } from './core/links';
import { PREVIEW_MESSAGES, SITE_META, SITE_NAME } from './core/page-meta';

const { seo, home, games, privacy, suggestions, admin, rooms } = PREVIEW_MESSAGES;

/** Page title and description of a game, for search results and link previews; the page opens only when the game does */
function gameMeta(slug: GameSlug): Pick<Route, 'title' | 'data' | 'canActivate'> {
  const { name, subtitle, intro, summary } = games[slug];
  return {
    title: `${name}: ${subtitle} · ${SITE_NAME}`,
    data: { description: `${intro} ${summary}` },
    canActivate: [gameAvailableGuard(slug)],
  };
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
    path: 'hit-the-note',
    ...gameMeta('hit-the-note'),
    loadComponent: () => import('./pages/hit-the-note/hit-the-note-page').then((m) => m.HitTheNotePage),
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
    path: 'rooms',
    title: `${rooms.title} · ${SITE_NAME}`,
    data: { description: `${rooms.lead} ${rooms.rule}` },
    loadComponent: () => import('./pages/rooms/rooms-page').then((m) => m.RoomsPage),
  },
  {
    // A room by its code; built in the browser, as every room is different
    path: 'r/:code',
    title: `${rooms.title} · ${SITE_NAME}`,
    data: { description: rooms.lead, noIndex: true },
    loadComponent: () => import('./pages/rooms/room-page').then((m) => m.RoomPage),
  },
  {
    path: 'privacy',
    title: `${privacy.title} · ${SITE_NAME}`,
    data: { description: privacy.lead },
    loadComponent: () => import('./pages/privacy/privacy-page').then((m) => m.PrivacyPage),
  },
  {
    path: 'suggestions',
    title: `${suggestions.title} · ${SITE_NAME}`,
    data: { description: suggestions.lead },
    loadComponent: () => import('./pages/suggestions/suggestions-page').then((m) => m.SuggestionsPage),
  },
  {
    // The admin's page: linked from nowhere and kept out of search results
    path: ADMIN_PATH,
    title: `${admin.title} · ${SITE_NAME}`,
    data: { description: admin.lead, noIndex: true },
    loadComponent: () => import('./pages/admin/admin-page').then((m) => m.AdminPage),
  },
  {
    // An invite link for a new moderator; never prerendered, as each link is different
    path: `${ADMIN_INVITE_PATH}/:secret`,
    title: `${admin.inviteTitle} · ${SITE_NAME}`,
    data: { description: admin.lead, noIndex: true },
    loadComponent: () => import('./pages/admin/admin-invite-page').then((m) => m.AdminInvitePage),
  },
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
