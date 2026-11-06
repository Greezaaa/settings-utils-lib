import type { SuPackage } from './packages';

/** Public address of this website, without a trailing slash (also used in index.html and robots.txt) */
export const SITE_URL = 'https://su-labs.dev';

/** Image shown when a page is shared (1200x630, in web/public) */
export const SITE_PREVIEW_IMAGE_URL = `${SITE_URL}/og-image.png`;

/** How to reach the author */
export const AUTHOR_EMAIL_URL = 'mailto:yev.alekseyev@gmail.com';

/** GitHub repository that hosts the libraries, docs and changelogs */
export const GITHUB_REPO_URL = 'https://github.com/Greezaaa/settings-utils-lib';

/** Raw file host for the `main` branch, used to load changelogs live */
const RAW_MAIN_URL = 'https://raw.githubusercontent.com/Greezaaa/settings-utils-lib/main';

/** Installation guides for every environment */
export const GUIDES_URL = `${GITHUB_REPO_URL}/blob/main/docs/README.md`;

/** Link to one environment guide, e.g. `guideUrl('react')` */
export const guideUrl = (environment: string): string => `${GITHUB_REPO_URL}/blob/main/docs/guides/${environment}.md`;

/** README of a package folder under `projects/su-labs` */
export const readmeUrl = (folder: string): string => `${GITHUB_REPO_URL}/tree/main/projects/su-labs/${folder}#readme`;

/** CHANGELOG.md of a package folder on GitHub */
export const changelogUrl = (folder: string): string => `${GITHUB_REPO_URL}/blob/main/projects/su-labs/${folder}/CHANGELOG.md`;

/** Raw CHANGELOG.md of a package folder, fetched by the site */
export const changelogRawUrl = (folder: string): string => `${RAW_MAIN_URL}/projects/su-labs/${folder}/CHANGELOG.md`;

/** npm page of a package */
export const npmUrl = (packageName: string): string => `https://www.npmjs.com/package/${packageName}`;

/** VS Code Marketplace page of an extension, by its `publisher.name` ID */
export const marketplaceUrl = (extensionId: string): string =>
  `https://marketplace.visualstudio.com/items?itemName=${extensionId}`;

/** Open VSX page of an extension (Cursor, VSCodium and other editors), by its `publisher.name` ID */
export const openVsxUrl = (extensionId: string): string => `https://open-vsx.org/extension/${extensionId.replace('.', '/')}`;

/** A link to where a package is published */
export interface RegistryLink {
  readonly label: string;
  readonly url: string;
}

/** Link to a package in the registry it's published to */
export function registryLink({ packageName, registry = 'npm' }: SuPackage): RegistryLink {
  return registry === 'vscode-marketplace'
    ? { label: 'VS Code Marketplace', url: marketplaceUrl(packageName) }
    : { label: 'npm', url: npmUrl(packageName) };
}
