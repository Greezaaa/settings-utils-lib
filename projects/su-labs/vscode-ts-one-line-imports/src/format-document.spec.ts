// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { formatDocument } from './format-document.ts';
import { clearProjectPrettierCache } from './project-prettier.ts';

/** An import longer than Prettier's default print width of 80 */
const LONG_IMPORT = "import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';";

/** Code with a long import and messy formatting elsewhere */
const CODE = `${LONG_IMPORT}\nconst   value = { a:1, b:'two' }\n`;

/** The same import, wrapped the way Prettier does it without the plugin */
const WRAPPED_IMPORT = LONG_IMPORT.replace('{ ', '{\n  ').replaceAll(', ', ',\n  ').replace(' }', ',\n}');

let root: string;

/** Writes files into a temporary project and returns the path of `src/app.ts` in it */
function createProject(files: Record<string, string>): string {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return join(root, 'src/app.ts');
}

/** Formats `CODE` as `src/app.ts` of a project with the given files */
const formatInProject = (files: Record<string, string>, text = CODE) =>
  formatDocument({ text, parser: 'typescript', filePath: createProject(files) });

beforeEach(async () => {
  root = mkdtempSync(join(tmpdir(), 'single-line-imports-'));
  await clearProjectPrettierCache();
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe('formatDocument', () => {
  describe('project with a Prettier config', () => {
    it("formats with the project's own options and keeps imports on one line", async () => {
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': '{ "singleQuote": false, "semi": false, "tabWidth": 4 }' });
      expect(result.mode).toBe('prettier');
      expect(result.text).toBe(`${LONG_IMPORT.replaceAll("'", '"').replace(/;$/, '')}\nconst value = { a: 1, b: "two" }\n`);
    });

    it('supports every kind of config file', async () => {
      const configs: Record<string, string> = {
        '.prettierrc.json': '{ "semi": false, "singleQuote": true }',
        '.prettierrc.yaml': 'semi: false\nsingleQuote: true\n',
        'prettier.config.mjs': 'export default { semi: false, singleQuote: true };\n',
        'prettier.config.cjs': 'module.exports = { semi: false, singleQuote: true };\n',
        'package.json': '{ "prettier": { "semi": false, "singleQuote": true } }',
      };
      for (const [file, content] of Object.entries(configs)) {
        rmSync(root, { recursive: true, force: true });
        mkdirSync(root);
        await clearProjectPrettierCache();
        const result = await formatInProject({ 'package.json': '{}', [file]: content });
        expect(result.text, file).toBe(`${LONG_IMPORT.replace(/;$/, '')}\nconst value = { a: 1, b: 'two' }\n`);
      }
    });

    it('applies overrides for matching files', async () => {
      const config = { overrides: [{ files: 'src/**/*.ts', options: { semi: false } }] };
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': JSON.stringify(config) });
      expect(result.text).toContain('const value = { a: 1, b: "two" }\n');
    });

    it('respects .editorconfig next to the config', async () => {
      const code = `${LONG_IMPORT}\nfunction f() {\nreturn 1;\n}\n`;
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': '{ "singleQuote": true }', '.editorconfig': '[*]\nindent_style = tab\n' }, code);
      expect(result.text).toBe(`${LONG_IMPORT}\nfunction f() {\n\treturn 1;\n}\n`);
    });

    it('keeps imports on one line even when the config switches the TypeScript parser to babel-ts', async () => {
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': '{ "parser": "babel-ts", "singleQuote": true }' });
      expect(result.text?.split('\n')[0]).toBe(LONG_IMPORT);
    });

    it('loads plugins the project installed, by package name', async () => {
      const plugin = "module.exports = { languages: [{ name: 'fake', parsers: ['fake'], extensions: ['.fake'] }] };";
      const result = await formatInProject({
        'package.json': '{}',
        '.prettierrc': '{ "plugins": ["prettier-plugin-fake"], "singleQuote": true }',
        'node_modules/prettier-plugin-fake/package.json': '{ "name": "prettier-plugin-fake", "main": "index.js" }',
        'node_modules/prettier-plugin-fake/index.js': plugin,
      });
      expect(result.mode).toBe('prettier');
      expect(result.warning).toBeUndefined();
      expect(result.text?.split('\n')[0]).toBe(LONG_IMPORT);
    });

    it('skips this plugin when the project lists it itself, even if it is not installed', async () => {
      const config = { singleQuote: true, plugins: ['@su-labs/prettier-plugin-single-line-imports', './tools/prettier-plugin-single-line-imports/src/index.ts'] };
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': JSON.stringify(config) });
      expect(result.mode).toBe('prettier');
      expect(result.text?.split('\n')[0]).toBe(LONG_IMPORT);
    });

    it("only joins imports, with a warning, when the project's plugins are not installed", async () => {
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': '{ "plugins": ["prettier-plugin-missing"] }' }, `${WRAPPED_IMPORT}\nconst   x = 1\n`);
      expect(result.mode).toBe('imports-only');
      expect(result.warning).toContain('prettier-plugin-missing');
      expect(result.text).toBe(`${LONG_IMPORT}\nconst   x = 1\n`);
    });

    it('leaves files listed in .prettierignore alone', async () => {
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': '{}', '.prettierignore': 'src/\n' });
      expect(result).toEqual({ text: null, mode: 'ignored' });
    });

    it('returns null when the file is already formatted', async () => {
      const formatted = `${LONG_IMPORT}\nconst value = { a: 1, b: 'two' };\n`;
      const result = await formatInProject({ 'package.json': '{}', '.prettierrc': '{ "singleQuote": true }' }, formatted);
      expect(result).toEqual({ text: null, mode: 'prettier', warning: undefined });
    });

    it('throws on code that cannot be parsed', async () => {
      await expect(formatInProject({ 'package.json': '{}', '.prettierrc': '{}' }, 'const = ;')).rejects.toThrow();
    });
  });

  describe('project with Prettier installed but no config', () => {
    it("formats with Prettier's defaults", async () => {
      const result = await formatInProject({ 'package.json': '{ "devDependencies": { "prettier": "^3.0.0" } }' });
      expect(result.mode).toBe('prettier');
      expect(result.text).toBe(`${LONG_IMPORT.replaceAll("'", '"')}\nconst value = { a: 1, b: "two" };\n`);
    });
  });

  describe('project without Prettier', () => {
    it('only joins the imports and leaves the rest of the code as it is', async () => {
      const result = await formatInProject({ 'package.json': '{ "devDependencies": { "eslint": "^9.0.0" } }' }, `${WRAPPED_IMPORT}\nconst   x = 1\n`);
      expect(result).toEqual({ text: `${LONG_IMPORT}\nconst   x = 1\n`, mode: 'imports-only', warning: undefined });
    });

    it('works without any package.json', async () => {
      const filePath = join(root, 'loose/app.ts');
      mkdirSync(dirname(filePath), { recursive: true });
      const result = await formatDocument({ text: WRAPPED_IMPORT, parser: 'typescript', filePath });
      expect(result.text ?? WRAPPED_IMPORT).toContain(LONG_IMPORT);
    });
  });

  describe('unsaved document', () => {
    it('only joins the imports', async () => {
      const result = await formatDocument({ text: `${WRAPPED_IMPORT}\nconst   x = 1\n`, parser: 'typescript' });
      expect(result).toEqual({ text: `${LONG_IMPORT}\nconst   x = 1\n`, mode: 'imports-only', warning: undefined });
    });
  });
});
