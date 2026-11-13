import { GAMES_URL } from './links';
import { UTILITIES } from './packages';

export type SiteMenuLink =
  | { readonly label: string; readonly route: string }
  | { readonly label: string; readonly href: string };

export interface SiteMenuSection {
  readonly id: string;
  readonly title: string;
  readonly links: readonly SiteMenuLink[];
  readonly openByDefault?: boolean;
}

export const sectionHasRoute = (section: SiteMenuSection, url: string): boolean =>
  section.links.some((link) => 'route' in link && (url === link.route || url.startsWith(`${link.route}/`)));

export const SITE_MENU: readonly SiteMenuSection[] = [
  {
    id: 'packages',
    title: 'Packages',
    openByDefault: true,
    links: UTILITIES.map(({ name, slug }) => ({
      label: name,
      route: `/${slug}`,
    })),
  },
  {
    id: 'extensions',
    title: 'Extensions & tools',
    links: [{ label: 'One-line imports', route: '/one-line-imports' }],
  },
  {
    id: 'apps',
    title: 'Apps',
    links: [{ label: 'Smart games', href: GAMES_URL }],
  },
  {
    id: 'project',
    title: 'Project',
    links: [{ label: 'Changelog', route: '/changelog' }],
  },
];
