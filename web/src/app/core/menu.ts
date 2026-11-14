import { GAMES_URL } from './links';
import { UTILITIES } from './packages';
import { SiteIconName } from './site-icons';

export type SiteMenuLink = { readonly key: string; readonly label: string; readonly icon: SiteIconName } & (
  | { readonly route: string }
  | { readonly href: string }
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
    links: [{ key: 'one-line-imports', label: 'One-line imports', icon: 'imports', route: '/one-line-imports' }],
  },
  {
    id: 'apps',
    title: 'Apps',
    links: [{ key: 'games', label: 'Smart games', icon: 'games', href: GAMES_URL }],
  },
  {
    id: 'project',
    title: 'Project',
    links: [{ key: 'changelog', label: 'Changelog', icon: 'changelog', route: '/changelog' }],
  },
];
