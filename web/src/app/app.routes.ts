import { Route, Routes } from '@angular/router';
import { SITE_META, SITE_NAME, utilityMeta } from './core/page-meta';

/** The not-found page: prerendered at /404 (copied to 404.html after the build) and shown for unknown links */
const notFound = {
  title: `Page not found · ${SITE_NAME}`,
  data: { description: 'This page doesn’t exist.', noIndex: true },
  loadComponent: () => import('./pages/not-found/not-found-page').then((m) => m.NotFoundPage),
} satisfies Omit<Route, 'path'>;

export const routes: Routes = [
  {
    path: 'privacy',
    title: `Privacy · ${SITE_NAME}`,
    data: { description: 'What su-labs.dev saves, where and why, and how to turn saving off.' },
    loadComponent: () => import('./pages/privacy/privacy-page').then((m) => m.PrivacyPage),
  },
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
    path: 'dialog',
    title: `Dialog · ${SITE_NAME}`,
    data: utilityMeta('dialog'),
    loadComponent: () => import('./pages/dialog/dialog-page').then((m) => m.DialogPage),
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
    path: 'fields',
    title: `Fields · ${SITE_NAME}`,
    data: utilityMeta('fields'),
    loadComponent: () => import('./pages/fields/fields-page').then((m) => m.FieldsPage),
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
  { path: '404', ...notFound },
  { path: '**', ...notFound },
];
