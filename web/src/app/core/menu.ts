import { SITE_APPS } from './apps';
import { UTILITIES } from './packages';
import { SiteIconName } from './site-icons';
import { SITE_TOOLS } from './tools';

export type SiteMenuLink = { readonly key: string; readonly label: string; readonly icon: SiteIconName } & (
  | { readonly route: string }
  | { readonly href: string; readonly tag?: string }
  | { readonly soon: true }
);

export interface SiteMenuSection {
  readonly id: string;
  readonly title: string;
  readonly railTitle?: string;
  readonly links: readonly SiteMenuLink[];
  readonly openByDefault?: boolean;
}

export const sectionHasRoute = (section: SiteMenuSection, url: string): boolean =>
  section.links.some((link) => 'route' in link && (url === link.route || url.startsWith(`${link.route}/`)));

const PACKAGE_ICONS: Readonly<Record<string, SiteIconName>> = {
  theme: 'theme',
  'font-size': 'font-size',
  notifications: 'notifications',
  dialog: 'dialog',
  table: 'table',
  'tree-table': 'tree-table',
  skeleton: 'skeleton',
  stepper: 'stepper',
  tooltip: 'tooltip',
  select: 'select',
  'scroll-spy': 'scroll-spy',
  'visit-tracker': 'visit-tracker',
  fields: 'fields',
};

export const SITE_MENU: readonly SiteMenuSection[] = [
  {
    id: 'packages',
    title: 'Packages',
    openByDefault: true,
    links: UTILITIES.map(({ name, slug }) => ({
      key: slug,
      label: name,
      icon: PACKAGE_ICONS[slug] ?? 'packages',
      route: `/${slug}`,
    })),
  },
  {
    id: 'extensions',
    title: 'Extensions & tools',
    railTitle: 'Tools',
    links: SITE_TOOLS.map(({ slug, name, icon }) => ({ key: slug, label: name, icon, route: `/${slug}` })),
  },
  {
    id: 'apps',
    title: 'Apps',
    links: SITE_APPS.map(({ key, name, icon, url, isBeta }) =>
      url
        ? { key, label: name, icon, href: url, ...(isBeta ? { tag: 'Beta' } : {}) }
        : { key, label: name, icon, soon: true as const },
    ),
  },
  {
    id: 'project',
    title: 'Project',
    links: [{ key: 'changelog', label: 'Changelog', icon: 'changelog', route: '/changelog' }],
  },
];
