import { execFileSync } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'web', 'src', 'app', 'pages');
const outputFile = join(
  root,
  'web',
  'src',
  'app',
  'shared',
  'demo-block',
  'demo-sources.ts'
);
const EXTENSIONS = ['.ts', '.html', '.scss'];
const OUTSIDE_IMPORT = /from '(\.\.\/[^']+)'/g;
const DEMO_FOLDERS = [
  'css-tricks/css-tricks',
  'dialog/morph-menu',
  'fields/date-range',
  'fields/elastic-toggle',
  'fields/floating-field',
  'fields/upload-zone',
  'micro-interactions/card-detail',
  'micro-interactions/copy-button',
  'micro-interactions/delete-list',
  'micro-interactions/pin-button',
  'spring-easing/spring-photo',
];

const extensionRank = name =>
  EXTENSIONS.findIndex(extension => name.endsWith(extension));

const outsideImports = (folder, code) =>
  [...code.matchAll(OUTSIDE_IMPORT)].map(
    ([, path]) => relative(root, resolve(pagesDir, folder, path)) + '.ts'
  );

async function tabsFor(folder) {
  const files = (await readdir(join(pagesDir, folder)))
    .filter(name => extensionRank(name) >= 0 && !name.endsWith('.spec.ts'))
    .sort((a, b) => extensionRank(a) - extensionRank(b) || a.localeCompare(b));
  const tabs = [];
  for (const name of files) {
    const code = (
      await readFile(join(pagesDir, folder, name), 'utf8')
    ).trimEnd();
    const uses = outsideImports(folder, code);
    tabs.push({
      label: name,
      code,
      ...(uses.length ? { note: `Also uses ${uses.join(' and ')}.` } : {}),
    });
  }
  return tabs;
}

const sources = {};
for (const folder of DEMO_FOLDERS) {
  sources[basename(folder)] = await tabsFor(folder);
}

const output = `import { CodeTab } from '../code-tabs';

export type DemoName = ${Object.keys(sources)
  .map(name => `'${name}'`)
  .join(' | ')};

export const DEMO_SOURCES: Readonly<Record<DemoName, readonly CodeTab[]>> = ${JSON.stringify(sources, null, 2)};
`;

await writeFile(outputFile, output);
execFileSync('npx', ['prettier', '--write', outputFile], {
  cwd: root,
  stdio: 'ignore',
});
console.log(
  `Wrote the code of ${DEMO_FOLDERS.length} demos to ${relative(root, outputFile)}`
);
