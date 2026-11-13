import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, join } from 'node:path';
import * as prettier from 'prettier';
import type { Options } from 'prettier';
import singleLineImports from '../../prettier-plugin-single-line-imports/src/index.ts';

/** Matches the plugin when a project lists it itself, by package name or by path */
const OWN_PLUGIN = /prettier-plugin-single-line-imports/;

/** Dependency fields of a package.json that can bring in Prettier */
const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies'] as const;

/** A plugin as a Prettier config lists it: a name, a path, a URL or the plugin itself */
type PluginEntry = NonNullable<Options['plugins']>[number];

/** The parts of a package.json read here */
type PackageJson = Partial<Record<(typeof DEPENDENCY_FIELDS)[number], Record<string, string>>>;

/** How a project uses Prettier */
export type ProjectPrettier =
  /** No Prettier config and no Prettier dependency */
  | { readonly kind: 'none' }
  /** The project's `.prettierignore` excludes the file */
  | { readonly kind: 'ignored' }
  /** Options to format with: the project's own, plus this plugin */
  | { readonly kind: 'prettier'; readonly options: Options };

/** A plugin from the project's config that couldn't be loaded, usually because `npm install` hasn't run */
export class ProjectPluginError extends Error {
  constructor(plugin: string, configFile: string) {
    super(`Can't load the Prettier plugin "${plugin}" listed in ${configFile}. Run npm install in that project.`);
    this.name = 'ProjectPluginError';
  }
}

/** The closest package.json above a file, or `null` */
function findPackageJson(filePath: string): string | null {
  for (let dir = dirname(filePath); ; dir = dirname(dir)) {
    const candidate = join(dir, 'package.json');
    if (existsSync(candidate)) return candidate;
    if (dirname(dir) === dir) return null;
  }
}

/** Whether a package.json lists Prettier as a dependency of any kind */
function dependsOnPrettier(packageJsonPath: string): boolean {
  try {
    const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    return DEPENDENCY_FIELDS.some((field) => packageJson[field]?.['prettier'] !== undefined);
  } catch {
    return false;
  }
}

/**
 * Turns a plugin name from the project's config into a path, resolved from the config's folder like the Prettier CLI does.
 * Prettier already makes relative paths absolute; package names are resolved here.
 */
function resolvePlugin(plugin: PluginEntry, configFile: string): PluginEntry {
  if (typeof plugin !== 'string' || isAbsolute(plugin)) return plugin;
  try {
    return createRequire(configFile).resolve(plugin);
  } catch {
    throw new ProjectPluginError(plugin, configFile);
  }
}

/** The project's plugins without this one, which is added from the extension itself */
function projectPlugins(plugins: Options['plugins'], configFile: string): PluginEntry[] {
  return (plugins ?? [])
    .filter((plugin) => typeof plugin !== 'string' || !OWN_PLUGIN.test(plugin))
    .map((plugin) => resolvePlugin(plugin, configFile));
}

/**
 * Finds out how the project a file belongs to uses Prettier: its config file, `.editorconfig`, `.prettierignore` and plugins.
 * A project with Prettier as a dependency but no config file gets Prettier's defaults.
 *
 * @throws {ProjectPluginError} when a plugin from the project's config can't be found
 */
export async function resolveProjectPrettier(filePath: string): Promise<ProjectPrettier> {
  const configFile = await prettier.resolveConfigFile(filePath);
  const packageJson = findPackageJson(filePath);
  if (!configFile && !(packageJson && dependsOnPrettier(packageJson))) return { kind: 'none' };

  const projectRoot = dirname(configFile ?? packageJson ?? filePath);
  const ignorePath = join(projectRoot, '.prettierignore');
  const { ignored } = await prettier.getFileInfo(filePath, { ignorePath, resolveConfig: false });
  if (ignored) return { kind: 'ignored' };

  const config = (await prettier.resolveConfig(filePath, { editorconfig: true })) ?? {};
  const plugins = configFile ? projectPlugins(config.plugins, configFile) : [];
  return { kind: 'prettier', options: { ...config, plugins: [...plugins, singleLineImports] } };
}

/** Forgets cached configs, so edits to a project's Prettier config are picked up */
export const clearProjectPrettierCache = (): Promise<void> => prettier.clearConfigCache();
