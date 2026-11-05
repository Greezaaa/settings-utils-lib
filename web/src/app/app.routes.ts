import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'su-labs', loadComponent: () => import('./pages/home/home-page').then((m) => m.HomePage) },
  {
    path: 'theme',
    title: 'Theme · su-labs',
    loadComponent: () => import('./pages/theme/theme-page').then((m) => m.ThemePage),
  },
  {
    path: 'font-size',
    title: 'Font size · su-labs',
    loadComponent: () => import('./pages/font-size/font-size-page').then((m) => m.FontSizePage),
  },
  {
    path: 'notifications',
    title: 'Notifications · su-labs',
    loadComponent: () => import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage),
  },
  {
    path: 'scroll-spy',
    title: 'Scroll spy · su-labs',
    loadComponent: () => import('./pages/scroll-spy/scroll-spy-page').then((m) => m.ScrollSpyPage),
  },
  {
    path: 'visit-tracker',
    title: 'Visit tracker · su-labs',
    loadComponent: () => import('./pages/visit-tracker/visit-tracker-page').then((m) => m.VisitTrackerPage),
  },
  { path: 'changelog', redirectTo: 'changelog/core', pathMatch: 'full' },
  {
    path: 'changelog/:slug',
    title: 'Changelog · su-labs',
    loadComponent: () => import('./pages/changelog/changelog-page').then((m) => m.ChangelogPage),
  },
  { path: '**', redirectTo: '' },
];
