import type { SuPackage } from './packages';

export const SITE_URL = 'https://su-labs.dev';

export const GAMES_URL = 'https://games.su-labs.dev/';

export const SITE_PREVIEW_IMAGE_URL = `${SITE_URL}/og-image.png`;

export const SITE_PREVIEW_IMAGE = {
  width: '1200',
  height: '630',
  type: 'image/png',
  alt: 'su-labs: framework-agnostic browser utilities',
} as const;

export const AUTHOR_EMAIL_URL = 'mailto:yev.alekseyev@gmail.com';

export const GITHUB_REPO_URL = 'https://github.com/Greezaaa/settings-utils-lib';

const RAW_MAIN_URL = 'https://raw.githubusercontent.com/Greezaaa/settings-utils-lib/main';

export const GUIDES_URL = `${GITHUB_REPO_URL}/blob/main/docs/README.md`;

export const guideUrl = (environment: string): string => `${GITHUB_REPO_URL}/blob/main/docs/guides/${environment}.md`;

export const readmeUrl = (folder: string): string => `${GITHUB_REPO_URL}/tree/main/projects/su-labs/${folder}#readme`;

export const changelogUrl = (folder: string): string =>
  `${GITHUB_REPO_URL}/blob/main/projects/su-labs/${folder}/CHANGELOG.md`;

export const changelogRawUrl = (folder: string): string => `${RAW_MAIN_URL}/projects/su-labs/${folder}/CHANGELOG.md`;

export const npmUrl = (packageName: string): string => `https://www.npmjs.com/package/${packageName}`;

export const marketplaceUrl = (extensionId: string): string =>
  `https://marketplace.visualstudio.com/items?itemName=${extensionId}`;

export const githubReleasesUrl = (tagPrefix: string): string =>
  `${GITHUB_REPO_URL}/releases?q=${encodeURIComponent(tagPrefix)}&expanded=true`;

export const openVsxUrl = (extensionId: string): string =>
  `https://open-vsx.org/extension/${extensionId.replace('.', '/')}`;

export interface RegistryLink {
  readonly label: string;
  readonly url: string;
}

export function registryLink({ packageName, registry = 'npm' }: SuPackage): RegistryLink {
  return registry === 'vscode-marketplace'
    ? { label: 'VS Code Marketplace', url: marketplaceUrl(packageName) }
    : { label: 'npm', url: npmUrl(packageName) };
}
