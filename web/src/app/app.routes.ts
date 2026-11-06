import { Routes } from '@angular/router';
import { SITE_META, SITE_NAME, utilityMeta } from './core/page-meta';

export const routes: Routes = [
  {
    path: '',
    title: `${SITE_NAME}: settings utilities for Angular and any framework`,
    data: SITE_META,
    loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'theme',
    title: `Theme · ${SITE_NAME}`,
    data: utilityMeta('theme'),
    loadComponent: () => import('./pages/theme/theme-page').then((m) => m.ThemePage),
  },
  {
    path: 'font-size',
    title: `Font size · ${SITE_NAME}`,
    data: utilityMeta('font-size'),
    loadComponent: () => import('./pages/font-size/font-size-page').then((m) => m.FontSizePage),
  },
  {
    path: 'notifications',
    title: `Notifications · ${SITE_NAME}`,
    data: utilityMeta('notifications'),
    loadComponent: () => import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage),
  },
  {
    path: 'scroll-spy',
    title: `Scroll spy · ${SITE_NAME}`,
    data: utilityMeta('scroll-spy'),
    loadComponent: () => import('./pages/scroll-spy/scroll-spy-page').then((m) => m.ScrollSpyPage),
  },
  {
    path: 'visit-tracker',
    title: `Visit tracker · ${SITE_NAME}`,
    data: utilityMeta('visit-tracker'),
    loadComponent: () => import('./pages/visit-tracker/visit-tracker-page').then((m) => m.VisitTrackerPage),
  },
  {
    path: 'one-line-imports',
    title: `One-line imports · ${SITE_NAME}`,
    data: {
      description:
        'Keep every TypeScript and JavaScript import on one line: a VS Code extension for every project you open, and a Prettier plugin for your team and CI.',
    },
    loadComponent: () => import('./pages/one-line-imports/one-line-imports-page').then((m) => m.OneLineImportsPage),
  },
  { path: 'changelog', redirectTo: 'changelog/core', pathMatch: 'full' },
  {
    path: 'changelog/:slug',
    title: `Changelog · ${SITE_NAME}`,
    data: { description: 'Release notes for every @su-labs package, read live from each CHANGELOG.md on GitHub.' },
    loadComponent: () => import('./pages/changelog/changelog-page').then((m) => m.ChangelogPage),
  },
  { path: '**', redirectTo: '' },
];
