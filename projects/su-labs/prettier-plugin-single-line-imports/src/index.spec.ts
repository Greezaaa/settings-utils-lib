// @vitest-environment node
import { format, type Options } from 'prettier';
import { describe, expect, it } from 'vitest';
import plugin from './index';

/** The options this workspace uses, plus the plugin */
const OPTIONS: Options = { singleQuote: true, trailingComma: 'es5', printWidth: 80, plugins: [plugin] };

/** Format as the given file, so Prettier picks the parser from its extension like editors do */
const formatAs = (filepath: string, code: string, options: Options = {}): Promise<string> =>
  format(code, { ...OPTIONS, ...options, filepath });

const formatTs = (code: string, options?: Options): Promise<string> => formatAs('example.ts', code, options);

/** Same file formatted by Prettier without the plugin */
const formatWithoutPlugin = (code: string, filepath = 'example.ts'): Promise<string> =>
  format(code, { ...OPTIONS, plugins: [], filepath });

describe('prettier-plugin-single-line-imports', () => {
  describe('joins imports into one line', () => {
    it('should join the multi-line "not wanted" example', async () => {
      const code = `import {\n  A,\n  B,\n  C,\n  D,\n  E,\n  F,\n  G,\n  H,\n  I,\n  J,\n} from '@company/shared-library';\n`;

      expect(await formatTs(code)).toBe(`import { A, B, C, D, E, F, G, H, I, J } from '@company/shared-library';\n`);
    });

    it.each([
      ['named', `import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';\n`],
      ['type-only', `import type { SuThemeConfig, SuThemeName, SuThemeService, ThemeCssVariables } from '@su-labs/theme';\n`],
      ['inline type specifiers', `import { type ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';\n`],
      ['default and named', `import Default, { named1, named2, named3, named4, named5, named6 } from './a-very-long/module/path';\n`],
      ['default type', `import type DefaultTypeWithAVeryLongName from './some/deeply/nested/folder/structure/for/types';\n`],
      ['namespace', `import * as everything from '@angular/platform-browser-dynamic/some/really/long/entry/point/name';\n`],
      ['aliased', `import { aVeryLongExportName as shortName, anotherLongExportName as other } from './module';\n`],
      ['string export names', `import { 'a string export name' as stringName, anotherExportName, oneMore } from './module';\n`],
      ['side-effect', `import './a/very/long/path/to/some/global/styles/that/exceed/the/print/width/limit.css';\n`],
      ['with attributes', `import { firstVeryLongName, secondVeryLongName } from './data.json' with { type: 'json' };\n`],
      ['empty braces', `import {} from './a-module-imported-only-for-its-side-effects-with-a-long-name';\n`],
    ])('should keep a %s import on one line', async (_name, code) => {
      expect(await formatTs(code)).toBe(code);
    });

    it('should join every import in a file, not just the first', async () => {
      const code = `import {\n  a,\n  b,\n} from 'x';\nimport {\n  c,\n  d,\n} from 'y';\n\nexport const value = a;\n`;

      expect(await formatTs(code)).toBe(`import { a, b } from 'x';\nimport { c, d } from 'y';\n\nexport const value = a;\n`);
    });

    it('should keep a comment after the import at the end of the line', async () => {
      const code = `import {\n  firstName,\n  secondName,\n} from './module'; // why we need these\n`;

      expect(await formatTs(code)).toBe(`import { firstName, secondName } from './module'; // why we need these\n`);
    });

    it('should keep a doc comment above the import', async () => {
      const code = `/** Shared helpers */\nimport {\n  firstName,\n  secondName,\n} from './module';\n`;

      expect(await formatTs(code)).toBe(`/** Shared helpers */\nimport { firstName, secondName } from './module';\n`);
    });
  });

  describe('safeguards', () => {
    it.each([
      ['line comment', `import {\n  // keep this comment\n  First,\n  Second,\n} from './commented';\n`],
      ['trailing comment on a name', `import {\n  First, // the first one\n  Second,\n} from './commented';\n`],
    ])('should keep line breaks when the import contains a %s', async (_name, code) => {
      expect(await formatTs(code)).toBe(code);
    });

    it.each([
      ['a block comment', `import { /* why */ firstVeryLongExportName, secondVeryLongExportName } from './commented';\n`],
      ['a line comment', `import { firstVeryLongExportName, // first\n  secondVeryLongExportName } from './commented';\n`],
    ])('should leave an import with %s to Prettier', async (_name, code) => {
      expect(await formatTs(code)).toBe(await formatWithoutPlugin(code));
    });

    it('should not mistake // inside the module path for a comment', async () => {
      const code = `import {\n  First,\n  Second,\n} from 'https://cdn.example.com/lib.js';\n`;

      expect(await formatTs(code)).toBe(`import { First, Second } from 'https://cdn.example.com/lib.js';\n`);
    });

    it('should respect // prettier-ignore', async () => {
      const code = `// prettier-ignore\nimport {\n  First,\n    Second,\n} from './ignored';\n`;

      expect(await formatTs(code)).toBe(code);
    });

    it('should reject invalid code with the same error as Prettier', async () => {
      const broken = `import { a, from 'x';\n`;

      await expect(formatTs(broken)).rejects.toThrow(SyntaxError);
      await expect(formatWithoutPlugin(broken)).rejects.toThrow(SyntaxError);
    });
  });

  describe('leaves everything else to Prettier', () => {
    it.each([
      ['re-exports', `export { SuNotification, SuNotificationConfig, SuNotificationOptions } from '@su-labs/core/notifications';\n`],
      ['export all', `export * from './a/very/long/path/that/goes/on/and/on/and/on/until/it/wraps/somewhere';\n`],
      ['objects', `export const config = { alpha: 1, beta: 2, gamma: 3, delta: 4, epsilon: 5, zeta: 6, eta: 7 };\n`],
      ['calls', `const result = someFunction(argumentNumberOne, argumentNumberTwo, argumentNumberThree, four);\n`],
      ['dynamic imports', `const loaded = await import('./some/really/long/module/name/that/exceeds/the/limit/x.js');\n`],
      ['import-equals', `import someVeryLongAliasName = require('some-really-long-module-name-that-goes-on-and-on');\n`],
      [
        'Angular components with inline templates',
        `@Component({ selector: 'app-x', template: \`<div class="a"><span *ngIf="show">{{ value }}</span></div>\` })\nexport class X {}\n`,
      ],
    ])('should format %s exactly like Prettier', async (_name, code) => {
      expect(await formatTs(code)).toBe(await formatWithoutPlugin(code));
    });
  });

  describe('file types', () => {
    const LONG_IMPORT = `import { aVeryLongExportName, anotherVeryLongExportName, yetAnotherLongName } from './module';\n`;

    it.each(['example.ts', 'example.tsx', 'example.mts', 'example.cts', 'example.js', 'example.jsx', 'example.mjs', 'example.cjs'])(
      'should keep imports on one line in %s',
      async filepath => {
        expect(await formatAs(filepath, LONG_IMPORT)).toBe(LONG_IMPORT);
      }
    );

    it('should keep imports on one line inside TypeScript code blocks in Markdown', async () => {
      const markdown = `# Example\n\n\`\`\`ts\nimport {\n  aVeryLongExportName,\n  anotherVeryLongExportName,\n  yetAnotherLongName,\n} from './module';\n\`\`\`\n`;

      expect(await formatAs('README.md', markdown)).toBe(`# Example\n\n\`\`\`ts\n${LONG_IMPORT}\`\`\`\n`);
    });

    it.each([
      ['example.json', `{"name":"x","values":[1,2,3]}\n`],
      ['example.css', `.a{color:red;background:blue}\n`],
      ['example.html', `<div><app-x [value]="value" (changed)="onChanged($event)"></app-x></div>\n`],
    ])('should not change how %s is formatted', async (filepath, code) => {
      expect(await formatAs(filepath, code)).toBe(await formatWithoutPlugin(code, filepath));
    });
  });

  describe('Prettier options', () => {
    const MULTI_LINE = `import {\n  firstVeryLongName,\n  secondVeryLongName,\n} from './module';\n`;

    it.each<[string, Options, string]>([
      ['a tiny printWidth', { printWidth: 20 }, `import { firstVeryLongName, secondVeryLongName } from './module';\n`],
      ['tabs', { useTabs: true }, `import { firstVeryLongName, secondVeryLongName } from './module';\n`],
      ['no semicolons', { semi: false }, `import { firstVeryLongName, secondVeryLongName } from './module'\n`],
      ['double quotes', { singleQuote: false }, `import { firstVeryLongName, secondVeryLongName } from "./module";\n`],
      ['trailing commas everywhere', { trailingComma: 'all' }, `import { firstVeryLongName, secondVeryLongName } from './module';\n`],
      ['no bracket spacing', { bracketSpacing: false }, `import {firstVeryLongName, secondVeryLongName} from './module';\n`],
      ['Windows line endings', { endOfLine: 'crlf' }, `import { firstVeryLongName, secondVeryLongName } from './module';\r\n`],
    ])('should work with %s', async (_name, options, expected) => {
      expect(await formatTs(MULTI_LINE, options)).toBe(expected);
    });

    it('should read Windows line endings in the source', async () => {
      const code = MULTI_LINE.replace(/\n/g, '\r\n');

      expect(await formatTs(code, { endOfLine: 'auto' })).toBe(`import { firstVeryLongName, secondVeryLongName } from './module';\r\n`);
    });
  });

  it('should give the same result when run twice', async () => {
    const once = await formatTs(
      `import {\n  a,\n  b,\n} from 'x';\nimport {\n  // kept\n  c,\n} from 'y';\nconst value = someFunction(argumentNumberOne, argumentNumberTwo, argumentNumberThree);\n`
    );

    expect(await formatTs(once)).toBe(once);
  });
});
