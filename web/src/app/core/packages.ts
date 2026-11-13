export type SuRegistry = 'npm' | 'vscode-marketplace';

export interface SuPackage {
  readonly slug: string;
  readonly name: string;
  readonly packageName: string;
  readonly summary: string;
  readonly registry?: SuRegistry;
}

export interface SuUtility extends SuPackage {
  readonly coreEntry?: string;
}

export const CORE_PACKAGE: SuPackage = {
  slug: 'core',
  name: 'Core',
  packageName: '@su-labs/core',
  summary: 'Every utility without a framework, plus a tiny reactive store.',
};

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
    slug: 'dialog',
    name: 'Dialog',
    packageName: '@su-labs/dialog',
    coreEntry: '@su-labs/core/dialog',
    summary: 'Accessible confirm and message dialogs, answered with a promise and styled with CSS variables.',
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
  {
    slug: 'fields',
    name: 'Fields',
    packageName: '@su-labs/fields',
    summary: 'Animated form fields: code boxes, a password strength meter and a text box that grows as you type.',
  },
];

export const PRETTIER_PLUGIN: SuPackage = {
  slug: 'prettier-plugin-single-line-imports',
  name: 'Prettier plugin',
  packageName: '@su-labs/prettier-plugin-single-line-imports',
  summary: 'Keeps every import on one line in a project, for everyone and every tool that runs Prettier.',
};

export const VSCODE_EXTENSION: SuPackage = {
  slug: 'vscode-ts-one-line-imports',
  name: 'TS One-Line Imports',
  packageName: 'su-labs.ts-one-line-imports',
  summary:
    'Keeps every import on one line in every project you open in VS Code, using each project’s own Prettier config.',
  registry: 'vscode-marketplace',
};

export const TOOLS: readonly SuPackage[] = [VSCODE_EXTENSION, PRETTIER_PLUGIN];

export const ALL_PACKAGES: readonly SuPackage[] = [CORE_PACKAGE, ...UTILITIES, ...TOOLS];

export const findPackage = (slug: string): SuPackage | undefined => ALL_PACKAGES.find((item) => item.slug === slug);

export function getUtility(slug: string): SuUtility {
  const utility = UTILITIES.find((item) => item.slug === slug);
  if (!utility) {
    throw new Error(`Unknown utility: ${slug}`);
  }
  return utility;
}
