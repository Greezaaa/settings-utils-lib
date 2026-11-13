import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { githubReleasesUrl, openVsxUrl, readmeUrl, registryLink, RegistryLink } from '../../core/links';
import { PRETTIER_PLUGIN, SuPackage, VSCODE_EXTENSION } from '../../core/packages';
import { CodeBlock } from '../../shared/code-block';
import { CodeTab, CodeTabs } from '../../shared/code-tabs';
import { Reveal } from '../../shared/reveal';

const BEFORE = `import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';`;

const AFTER = `import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';`;

interface Option {
  readonly item: SuPackage;
  readonly title: string;
  readonly summary: string;
  readonly points: readonly string[];
  readonly install: string;
  readonly registry: RegistryLink;
  readonly readme: string;
  readonly download?: RegistryLink;
}

const OPTIONS: readonly Option[] = [
  {
    item: VSCODE_EXTENSION,
    title: 'VS Code extension',
    summary: 'Install once in your editor. Works in every project you open.',
    points: [
      'Nothing to add to any project',
      'Formats with each project’s own Prettier config, plugins and .editorconfig',
      'Projects without Prettier only get their imports joined, like TypeScript Hero did',
      'Only changes what you format in your editor',
    ],
    install: `code --install-extension ${VSCODE_EXTENSION.packageName}`,
    registry: registryLink(VSCODE_EXTENSION),
    readme: readmeUrl(VSCODE_EXTENSION.slug),
    download: { label: 'Download .vsix', url: githubReleasesUrl('ts-one-line-imports') },
  },
  {
    item: PRETTIER_PLUGIN,
    title: 'Prettier plugin',
    summary: 'Add it to a project. Everyone and every tool formats the same way.',
    points: [
      'Command-line Prettier, git hooks, CI and eslint-plugin-prettier all keep imports on one line',
      'Works in every editor that runs Prettier',
      'Zero dependencies, Prettier 3 only',
      'Has to be added to each project',
    ],
    install: `npm install --save-dev ${PRETTIER_PLUGIN.packageName}`,
    registry: registryLink(PRETTIER_PLUGIN),
    readme: readmeUrl(PRETTIER_PLUGIN.slug),
  },
];

const SETUP: readonly CodeTab[] = [
  {
    label: 'VS Code user settings',
    code: `// Cmd+Shift+P → Preferences: Open User Settings (JSON)
{
  "[typescript]": { "editor.defaultFormatter": "${VSCODE_EXTENSION.packageName}" },
  "[typescriptreact]": { "editor.defaultFormatter": "${VSCODE_EXTENSION.packageName}" },
  "[javascript]": { "editor.defaultFormatter": "${VSCODE_EXTENSION.packageName}" },
  "[javascriptreact]": { "editor.defaultFormatter": "${VSCODE_EXTENSION.packageName}" },
  "editor.formatOnSave": true,
  // Optional: sort imports and remove unused ones when formatting
  "tsOneLineImports.sortImports": true,
  "tsOneLineImports.removeUnusedImports": true
}`,
  },
  {
    label: 'prettier.config.js',
    code: `module.exports = {
  plugins: ['${PRETTIER_PLUGIN.packageName}'],
};`,
  },
  {
    label: '.prettierrc',
    code: `{
  "plugins": ["${PRETTIER_PLUGIN.packageName}"]
}`,
  },
];

const PROJECT_MODES: readonly { readonly project: string; readonly result: string }[] = [
  {
    project: 'A Prettier config',
    result: 'Formatted with that config: options, overrides, plugins, .editorconfig and .prettierignore',
  },
  { project: 'Prettier installed, no config', result: 'Formatted with Prettier’s defaults' },
  { project: 'No Prettier', result: 'Only wrapped imports are joined; the rest of the code stays as it is' },
  { project: 'Prettier plugins not installed', result: 'Only imports are joined, with a hint to run npm install' },
  { project: 'The file in .prettierignore', result: 'Left alone' },
];

@Component({
  selector: 'app-one-line-imports-page',
  imports: [CodeBlock, CodeTabs, Reveal, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './one-line-imports-page.html',
  styleUrls: ['../../shared/utility-page.scss', './one-line-imports-page.scss'],
})
export class OneLineImportsPage {
  protected readonly before = BEFORE;
  protected readonly after = AFTER;
  protected readonly options = OPTIONS;
  protected readonly setup = SETUP;
  protected readonly projectModes = PROJECT_MODES;
  protected readonly openVsxUrl = openVsxUrl(VSCODE_EXTENSION.packageName);
}
