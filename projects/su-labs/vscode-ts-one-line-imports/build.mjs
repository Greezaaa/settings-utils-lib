import { build } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(packageDir, '../../../dist/su-labs/vscode-ts-one-line-imports');

/** Files that ship next to the bundle; vsce reads the manifest, icon, README, CHANGELOG and LICENSE from here */
const PACKAGE_FILES = ['package.json', 'images/icon.png', 'README.md', 'CHANGELOG.md', 'LICENSE'];

rmSync(outDir, { recursive: true, force: true });

await build({
  entryPoints: [join(packageDir, 'src/extension.ts')],
  outfile: join(outDir, 'extension.js'),
  bundle: true,
  minify: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode'],
  banner: { js: "const importMetaUrl = require('node:url').pathToFileURL(__filename).href;" },
  define: { 'import.meta.url': 'importMetaUrl' },
  logLevel: 'warning',
});

for (const file of PACKAGE_FILES) {
  mkdirSync(dirname(join(outDir, file)), { recursive: true });
  copyFileSync(join(packageDir, file), join(outDir, file));
}
