import { GAMES_URL } from './links';
import { UTILITIES } from './packages';

/** One menu entry: a page of this site (`route`) or another site (`href`) */
export type SiteMenuLink =
  | { readonly label: string; readonly route: string }
  | { readonly label: string; readonly href: string };

/** A titled group of menu entries */
export interface SiteMenuSection {
  /** Unique key, also used for the heading's id */
  readonly id: string;
  readonly title: string;
  readonly links: readonly SiteMenuLink[];
  /** Shown expanded when the site loads; the others start collapsed */
  readonly openByDefault?: boolean;
}

/** Whether a section has a link to this site's page at `url` (e.g. `/changelog/core` matches `/changelog`) */
export const sectionHasRoute = (section: SiteMenuSection, url: string): boolean =>
  section.links.some((link) => 'route' in link && (url === link.route || url.startsWith(`${link.route}/`)));

/**
 * The site menu, grouped by kind: npm packages, editor extensions and tools, standalone apps, then project pages.
 * New apps go in the `apps` section.
 */
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
