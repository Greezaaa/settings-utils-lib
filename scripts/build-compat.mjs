// Builds the @su-labs Angular packages for an older Angular major from the same source:
//   node scripts/build-compat.mjs 19 [package…]   →   dist/su-labs-ng19/<package>
// Each package is copied into compat/angular-<major>/build, compiled with that folder's Angular toolchain, and given
// the version <major>.<minor>.<patch> of its current release with peer dependencies on Angular <major>.
// A small app using every package is then built with the same Angular, so the linker proves the packages fit it.
// Publish with a dist-tag so `latest` stays on the newest Angular: npm publish --tag ng<major>
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SUPPORTED = ['19', '20'];
const SKIPPED = new Set(['core', 'prettier-plugin-single-line-imports', 'vscode-ts-one-line-imports']);
// Angular 22 renamed ChangeDetectionStrategy.Default to Eager; older majors only know Default
const SOURCE_PATCHES = [['ChangeDetectionStrategy.Eager', 'ChangeDetectionStrategy.Default']];

const [major, ...only] = process.argv.slice(2);
if (!SUPPORTED.includes(major)) {
  throw new Error(`Usage: node scripts/build-compat.mjs <${SUPPORTED.join('|')}> [package…]`);
}

const toolchain = join(ROOT, 'compat', `angular-${major}`);
const buildDir = join(toolchain, 'build');
const distDir = join(ROOT, `dist/su-labs-ng${major}`);
const coreBuild = join(ROOT, 'dist/su-labs/core');
if (!existsSync(join(toolchain, 'node_modules'))) {
  throw new Error(`Install the Angular ${major} toolchain first: (cd compat/angular-${major} && npm ci)`);
}
if (!existsSync(coreBuild)) {
  throw new Error('Build @su-labs/core first: npm run build:core');
}

const packagesDir = join(ROOT, 'projects/su-labs');
const packages = readdirSync(packagesDir).filter(
  (name) =>
    !SKIPPED.has(name) &&
    existsSync(join(packagesDir, name, 'ng-package.json')) &&
    (only.length === 0 || only.includes(name)),
);

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
const run = (command, args) => execFileSync(join(toolchain, 'node_modules/.bin', command), args, { cwd: toolchain, stdio: 'inherit' });

const corePaths = { '@su-labs/core': [coreBuild], '@su-labs/core/*': [`${coreBuild}/*`] };
const compilerOptions = {
  strict: true,
  noImplicitOverride: true,
  noPropertyAccessFromIndexSignature: true,
  noImplicitReturns: true,
  noFallthroughCasesInSwitch: true,
  skipLibCheck: true,
  isolatedModules: true,
  experimentalDecorators: true,
  importHelpers: true,
  target: 'ES2022',
  module: 'ES2022',
  moduleResolution: 'bundler',
  lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  types: [],
};

function patchSources(dir) {
  for (const file of readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((name) => name.endsWith('.ts'))) {
    const path = join(dir, file);
    const before = readFileSync(path, 'utf8');
    const after = SOURCE_PATCHES.reduce((text, [from, to]) => text.replaceAll(from, to), before);
    if (after !== before) {
      writeFileSync(path, after);
    }
  }
}

const TYPESCRIPT_FLOOR = { 19: '5.5', 20: '5.8' };

function patchReadme(work, name) {
  const path = join(work, 'README.md');
  if (!existsSync(path)) {
    return;
  }
  const packageName = `@su-labs/${name}`;
  const text = readFileSync(path, 'utf8')
    .replace(
      /^On Angular 19 or 20, install the matching version:.*$/m,
      `This is the Angular ${major} version. For the newest Angular, install \`${packageName}\` without a tag.${
        name === 'notifications' ? ' Before Angular 20.2, notifications show and hide without the slide animation.' : ''
      }`,
    )
    .replaceAll(`npm install ${packageName}\n`, `npm install ${packageName}@ng${major}\n`)
    .replaceAll('@angular/common@^22 @angular/core@^22', `@angular/common@^${major} @angular/core@^${major}`)
    .replaceAll('`@angular/core` and `@angular/common` 22', `\`@angular/core\` and \`@angular/common\` ${major}`)
    .replaceAll('Angular 22+', `Angular ${major}`)
    .replaceAll('TypeScript 6.0+', `TypeScript ${TYPESCRIPT_FLOOR[major]}+`);
  writeFileSync(path, text);
}

function compatVersion(version) {
  const [, minor, patch] = version.split('.');
  return `${major}.${minor}.${patch}`;
}

function preparePackage(name) {
  const work = join(buildDir, name);
  cpSync(join(packagesDir, name), work, {
    recursive: true,
    filter: (path) => !path.endsWith('.spec.ts') && !path.includes('node_modules'),
  });
  patchSources(join(work, 'src'));
  patchReadme(work, name);

  const manifest = readJson(join(work, 'package.json'));
  manifest.version = compatVersion(manifest.version);
  manifest.peerDependencies = Object.fromEntries(
    Object.entries(manifest.peerDependencies ?? {}).map(([dependency, range]) => [
      dependency,
      dependency.startsWith('@angular/') ? `^${major}.0.0` : range,
    ]),
  );
  writeJson(join(work, 'package.json'), manifest);

  const ngPackage = readJson(join(work, 'ng-package.json'));
  delete ngPackage.$schema;
  ngPackage.dest = relative(work, join(distDir, name));
  writeJson(join(work, 'ng-package.json'), ngPackage);

  writeJson(join(work, 'tsconfig.lib.json'), {
    compilerOptions: {
      ...compilerOptions,
      declaration: true,
      inlineSources: false,
      rootDir: './src',
      outDir: './out-tsc',
      paths: corePaths,
    },
    include: ['src/**/*.ts'],
    angularCompilerOptions: { compilationMode: 'partial', strictTemplates: true },
  });
  return manifest.version;
}

function buildSmokeApp() {
  const app = join(buildDir, 'smoke');
  mkdirSync(join(app, 'src'), { recursive: true });
  cpSync(join(ROOT, 'compat/smoke'), join(app, 'src'), { recursive: true });
  const installed = join(app, 'node_modules/@su-labs');
  cpSync(coreBuild, join(installed, 'core'), { recursive: true });
  for (const name of packages) {
    cpSync(join(distDir, name), join(installed, name), { recursive: true });
  }
  writeJson(join(app, 'tsconfig.json'), {
    compilerOptions,
    files: ['src/main.ts'],
    angularCompilerOptions: { strictTemplates: true },
  });
  writeJson(join(toolchain, 'angular.json'), {
    version: 1,
    cli: { analytics: false },
    projects: {
      smoke: {
        projectType: 'application',
        root: relative(toolchain, app),
        sourceRoot: relative(toolchain, join(app, 'src')),
        architect: {
          build: {
            builder: '@angular/build:application',
            options: {
              browser: relative(toolchain, join(app, 'src/main.ts')),
              polyfills: ['zone.js'],
              index: relative(toolchain, join(app, 'src/index.html')),
              tsConfig: relative(toolchain, join(app, 'tsconfig.json')),
              outputPath: relative(toolchain, join(buildDir, 'smoke-dist')),
            },
          },
        },
      },
    },
  });
  console.log(`\nSmoke app with every package (Angular ${major})`);
  run('ng', ['build', 'smoke']);
}

rmSync(buildDir, { recursive: true, force: true });
for (const name of only.length === 0 ? ['.'] : packages) {
  rmSync(join(distDir, name), { recursive: true, force: true });
}
cpSync(join(packagesDir, 'core'), join(buildDir, 'core'), {
  recursive: true,
  filter: (path) => !path.includes('node_modules'),
});

for (const name of packages) {
  console.log(`\n@su-labs/${name}@${preparePackage(name)} (Angular ${major})`);
  run('ng-packagr', ['-p', join(buildDir, name, 'ng-package.json'), '-c', join(buildDir, name, 'tsconfig.lib.json')]);
}
if (only.length === 0) {
  buildSmokeApp();
}
console.log(`\nBuilt ${packages.length} packages for Angular ${major} in dist/su-labs-ng${major}`);
