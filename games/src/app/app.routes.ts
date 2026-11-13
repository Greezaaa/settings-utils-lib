import { Route, Routes } from '@angular/router';
import { featureGuard } from './core/feature-guard';
import { gameAvailableGuard } from './core/game-guard';
import { GAME_CATEGORIES, gameInfo, GameSlug } from './core/games';
import { ADMIN_INVITE_PATH, ADMIN_PATH } from './core/links';
import { PREVIEW_MESSAGES, SITE_META, SITE_NAME } from './core/page-meta';

const {
  seo,
  home,
  games,
  privacy,
  suggestions,
  admin,
  rooms,
  categories,
  categoryIntros,
  account,
  leaderboard,
  colours,
} = PREVIEW_MESSAGES;

/**
 * Page title and description of a game, for search results and link previews; the page opens only when the game does.
 * A game closed by default stays out of search results, as its page sends visitors home.
 */
function gameMeta(
  slug: GameSlug
): Pick<Route, 'title' | 'data' | 'canActivate'> {
  const { name, subtitle, intro, summary } = games[slug];
  return {
    title: `${name}: ${subtitle} · ${SITE_NAME}`,
    data: { description: `${intro} ${summary}`, game: slug, noIndex: !gameInfo(slug).openByDefault },
    canActivate: [gameAvailableGuard(slug)],
  };
}

/** The not-found page: prerendered at /404 (copied to 404.html after the build) and shown for unknown links */
const notFound = {
  title: `${seo.notFoundTitle} · ${SITE_NAME}`,
  data: { description: seo.notFoundDescription, noIndex: true },
  loadComponent: () =>
    import('./pages/not-found/not-found-page').then(m => m.NotFoundPage),
} satisfies Omit<Route, 'path'>;

/** A page per category (from the categories menu), at /category/<category> */
const categoryRoutes: Routes = GAME_CATEGORIES.map(category => ({
  path: `category/${category}`,
  title: `${categories[category]} · ${SITE_NAME}`,
  data: { description: categoryIntros[category], category },
  canActivate: [featureGuard('category-menu')],
  loadComponent: () =>
    import('./pages/category/category-page').then(m => m.CategoryPage),
}));

export const routes: Routes = [
  {
    path: '',
    title: `${home.title} · ${SITE_NAME}`,
    data: SITE_META,
    loadComponent: () => import('./pages/home/home-page').then(m => m.HomePage),
  },
  {
    path: 'math-games',
    ...gameMeta('math-games'),
    loadComponent: () =>
      import('./pages/math-games/math-games-page').then(m => m.MathGamesPage),
  },
  {
    path: 'measure-it',
    ...gameMeta('measure-it'),
    loadComponent: () =>
      import('./pages/measure-it/measure-it-page').then(m => m.MeasureItPage),
  },
  {
    path: 'climb-tower',
    ...gameMeta('climb-tower'),
    loadComponent: () =>
      import('./pages/climb-tower/climb-tower-page').then(
        m => m.ClimbTowerPage
      ),
  },
  {
    path: 'letter-games',
    ...gameMeta('letter-games'),
    loadComponent: () =>
      import('./pages/letter-games/letter-games-page').then(
        m => m.LetterGamesPage
      ),
  },
  {
    path: 'hit-the-note',
    ...gameMeta('hit-the-note'),
    loadComponent: () =>
      import('./pages/hit-the-note/hit-the-note-page').then(
        m => m.HitTheNotePage
      ),
  },
  {
    path: 'sliding-puzzle',
    ...gameMeta('sliding-puzzle'),
    loadComponent: () =>
      import('./pages/sliding-puzzle/sliding-puzzle-page').then(
        m => m.SlidingPuzzlePage
      ),
  },
  {
    path: 'turn-picture',
    ...gameMeta('turn-picture'),
    loadComponent: () =>
      import('./pages/turn-picture/turn-picture-page').then(
        m => m.TurnPicturePage
      ),
  },
  {
    path: 'place-pieces',
    ...gameMeta('place-pieces'),
    loadComponent: () =>
      import('./pages/place-pieces/place-pieces-page').then(
        m => m.PlacePiecesPage
      ),
  },
  {
    path: 'find-pairs',
    ...gameMeta('find-pairs'),
    loadComponent: () =>
      import('./pages/find-pairs/find-pairs-page').then(m => m.FindPairsPage),
  },
  {
    path: 'how-many',
    ...gameMeta('how-many'),
    loadComponent: () =>
      import('./pages/how-many/how-many-page').then(m => m.HowManyPage),
  },
  {
    path: 'letter-sudoku',
    ...gameMeta('letter-sudoku'),
    loadComponent: () => import('./pages/letter-sudoku/letter-sudoku-page').then(m => m.LetterSudokuPage),
  },
  ...categoryRoutes,
  {
    path: 'rooms',
    title: `${rooms.title} · ${SITE_NAME}`,
    data: { description: `${rooms.lead} ${rooms.rule}` },
    canActivate: [featureGuard('rooms')],
    loadComponent: () =>
      import('./pages/rooms/rooms-page').then(m => m.RoomsPage),
  },
  {
    // A room by its code; built in the browser, as every room is different
    path: 'r/:code',
    title: `${rooms.title} · ${SITE_NAME}`,
    data: { description: rooms.lead, noIndex: true },
    canActivate: [featureGuard('rooms')],
    loadComponent: () =>
      import('./pages/rooms/room-page/room-page').then(m => m.RoomPage),
  },
  {
    path: 'account',
    title: `${account.title} · ${SITE_NAME}`,
    data: { description: account.lead, noIndex: true },
    canActivate: [featureGuard('accounts')],
    loadComponent: () =>
      import('./pages/account/account-page').then(m => m.AccountPage),
  },
  {
    // A password-reset link from an email; built in the browser, as every link is different
    path: 'account/reset/:secret',
    title: `${account.resetTitle} · ${SITE_NAME}`,
    data: { description: account.lead, noIndex: true },
    canActivate: [featureGuard('accounts')],
    loadComponent: () =>
      import('./pages/account/reset-page/reset-page').then(m => m.ResetPage),
  },
  {
    // Needs accounts too, as only signed-in players see it
    path: 'leaderboard',
    title: `${leaderboard.title} · ${SITE_NAME}`,
    data: { description: leaderboard.lead, noIndex: true },
    canActivate: [featureGuard('accounts'), featureGuard('leaderboard')],
    loadComponent: () =>
      import('./pages/leaderboard/leaderboard-page').then(
        m => m.LeaderboardPage
      ),
  },
  {
    path: 'colours',
    title: `${colours.title} · ${SITE_NAME}`,
    data: { description: colours.lead },
    canActivate: [featureGuard('colours-page')],
    loadComponent: () =>
      import('./pages/colours/colours-page').then(m => m.ColoursPage),
  },
  {
    path: 'privacy',
    title: `${privacy.title} · ${SITE_NAME}`,
    data: { description: privacy.lead },
    loadComponent: () =>
      import('./pages/privacy/privacy-page').then(m => m.PrivacyPage),
  },
  {
    path: 'suggestions',
    title: `${suggestions.title} · ${SITE_NAME}`,
    data: { description: suggestions.lead },
    loadComponent: () =>
      import('./pages/suggestions/suggestions-page').then(
        m => m.SuggestionsPage
      ),
  },
  {
    // The admin's page: linked from nowhere and kept out of search results
    path: ADMIN_PATH,
    title: `${admin.title} · ${SITE_NAME}`,
    data: { description: admin.lead, noIndex: true },
    loadComponent: () =>
      import('./pages/admin/admin-page').then(m => m.AdminPage),
  },
  {
    // An invite link for a new moderator; never prerendered, as each link is different
    path: `${ADMIN_INVITE_PATH}/:secret`,
    title: `${admin.inviteTitle} · ${SITE_NAME}`,
    data: { description: admin.lead, noIndex: true },
    loadComponent: () =>
      import('./pages/admin/admin-invite-page/admin-invite-page').then(m => m.AdminInvitePage),
  },
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
