import { Route, Routes } from '@angular/router';
import { SITE_META, SITE_NAME, utilityMeta } from './core/page-meta';
import { toolMeta } from './core/tools';

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
    title: `${SITE_NAME}: framework-agnostic browser utilities`,
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
    path: 'table',
    title: `Table · ${SITE_NAME}`,
    data: utilityMeta('table'),
    loadComponent: () => import('./pages/table/table-page').then((m) => m.TablePage),
  },
  {
    path: 'tree-table',
    title: `Tree table · ${SITE_NAME}`,
    data: utilityMeta('tree-table'),
    loadComponent: () => import('./pages/tree-table/tree-table-page').then((m) => m.TreeTablePage),
  },
  {
    path: 'skeleton',
    title: `Skeleton · ${SITE_NAME}`,
    data: utilityMeta('skeleton'),
    loadComponent: () => import('./pages/skeleton/skeleton-page').then((m) => m.SkeletonPage),
  },
  {
    path: 'stepper',
    title: `Stepper · ${SITE_NAME}`,
    data: utilityMeta('stepper'),
    loadComponent: () => import('./pages/stepper/stepper-page').then((m) => m.StepperPage),
  },
  {
    path: 'tooltip',
    title: `Tooltip · ${SITE_NAME}`,
    data: utilityMeta('tooltip'),
    loadComponent: () => import('./pages/tooltip/tooltip-page').then((m) => m.TooltipPage),
  },
  {
    path: 'select',
    title: `Select · ${SITE_NAME}`,
    data: utilityMeta('select'),
    loadComponent: () => import('./pages/select/select-page').then((m) => m.SelectPage),
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
    data: toolMeta('one-line-imports'),
    loadComponent: () => import('./pages/one-line-imports/one-line-imports-page').then((m) => m.OneLineImportsPage),
  },
  {
    path: 'cubic-bezier',
    title: `Cubic bezier · ${SITE_NAME}`,
    data: toolMeta('cubic-bezier'),
    loadComponent: () => import('./pages/cubic-bezier/cubic-bezier-page').then((m) => m.CubicBezierPage),
  },
  {
    path: 'spring-easing',
    title: `Spring easing · ${SITE_NAME}`,
    data: toolMeta('spring-easing'),
    loadComponent: () => import('./pages/spring-easing/spring-easing-page').then((m) => m.SpringEasingPage),
  },
  {
    path: 'gradient',
    title: `Gradient · ${SITE_NAME}`,
    data: toolMeta('gradient'),
    loadComponent: () => import('./pages/gradient/gradient-page').then((m) => m.GradientPage),
  },
  {
    path: 'box-shadow',
    title: `Box shadow · ${SITE_NAME}`,
    data: toolMeta('box-shadow'),
    loadComponent: () => import('./pages/box-shadow/box-shadow-page').then((m) => m.BoxShadowPage),
  },
  {
    path: 'clip-path',
    title: `Clip path · ${SITE_NAME}`,
    data: toolMeta('clip-path'),
    loadComponent: () => import('./pages/clip-path/clip-path-page').then((m) => m.ClipPathPage),
  },
  {
    path: 'contrast',
    title: `Contrast checker · ${SITE_NAME}`,
    data: toolMeta('contrast'),
    loadComponent: () => import('./pages/contrast/contrast-page').then((m) => m.ContrastPage),
  },
  {
    path: 'colors',
    title: `Colour converter · ${SITE_NAME}`,
    data: toolMeta('colors'),
    loadComponent: () => import('./pages/colors/colors-page').then((m) => m.ColorsPage),
  },
  {
    path: 'fluid-type',
    title: `Fluid type · ${SITE_NAME}`,
    data: toolMeta('fluid-type'),
    loadComponent: () => import('./pages/fluid-type/fluid-type-page').then((m) => m.FluidTypePage),
  },
  {
    path: 'lab',
    title: `Lab · ${SITE_NAME}`,
    data: { description: 'Components rebuilt from UI reels, to try by hand.', noIndex: true },
    loadComponent: () => import('./pages/lab/lab-page').then((m) => m.LabPage),
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
