/** A published package, identified by its folder under `projects/su-labs` */
export interface SuPackage {
  /** Folder name and URL segment, e.g. `font-size` */
  readonly slug: string;
  /** Display name, e.g. `Font size` */
  readonly name: string;
  /** npm package name */
  readonly packageName: string;
  /** One-line description */
  readonly summary: string;
}

/** A utility that ships both as an Angular package and as a `@su-labs/core` entry point */
export interface SuUtility extends SuPackage {
  /** Entry point in `@su-labs/core`, e.g. `@su-labs/core/theme` */
  readonly coreEntry: string;
}

/** The framework-agnostic package every utility is built on */
export const CORE_PACKAGE: SuPackage = {
  slug: 'core',
  name: 'Core',
  packageName: '@su-labs/core',
  summary: 'Every utility without a framework, plus a tiny reactive store.',
};

/** All utilities, in the order they appear on the site */
export const UTILITIES: readonly SuUtility[] = [
  {
    slug: 'theme',
    name: 'Theme',
    packageName: '@su-labs/theme',
    coreEntry: '@su-labs/core/theme',
    summary: 'Light, dark, high-contrast and system themes, applied as CSS variables and remembered.',
  },
  {
    slug: 'font-size',
    name: 'Font size',
    packageName: '@su-labs/font-size',
    coreEntry: '@su-labs/core/font-size',
    summary: 'Text size controls that stay within your limits and remember the reader’s choice.',
  },
  {
    slug: 'notifications',
    name: 'Notifications',
    packageName: '@su-labs/notifications',
    coreEntry: '@su-labs/core/notifications',
    summary: 'Toast messages with four types, six positions and automatic closing.',
  },
  {
    slug: 'scroll-spy',
    name: 'Scroll spy',
    packageName: '@su-labs/scroll-spy',
    coreEntry: '@su-labs/core/scroll-spy',
    summary: 'Know which section is on screen to highlight the matching navigation link.',
  },
  {
    slug: 'visit-tracker',
    name: 'Visit tracker',
    packageName: '@su-labs/visit-tracker',
    coreEntry: '@su-labs/core/visit-tracker',
    summary: 'Count returning visits, remember the last one and celebrate milestones.',
  },
];

/** Every package with a changelog: core first, then the utilities */
export const ALL_PACKAGES: readonly SuPackage[] = [CORE_PACKAGE, ...UTILITIES];

/** Find a package by slug */
export const findPackage = (slug: string): SuPackage | undefined => ALL_PACKAGES.find((item) => item.slug === slug);

/** Find a utility by slug; throws for unknown slugs because pages pass constants */
export function getUtility(slug: string): SuUtility {
  const utility = UTILITIES.find((item) => item.slug === slug);
  if (!utility) {
    throw new Error(`Unknown utility: ${slug}`);
  }
  return utility;
}
