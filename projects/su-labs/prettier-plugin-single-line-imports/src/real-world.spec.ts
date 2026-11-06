// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, type Options } from 'prettier';
import { describe, expect, it } from 'vitest';
import plugin from './index';

/**
 * Runs the plugin over every TypeScript file in this repository (libraries, core and website)
 * and compares the result with plain Prettier.
 */
const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const SKIPPED_FOLDERS = new Set(['node_modules', 'dist', '.angular', '.claude', '.git']);
const OPTIONS: Options = { singleQuote: true, trailingComma: 'es5', arrowParens: 'avoid', bracketSameLine: true, printWidth: 80 };

/** Every .ts file under a folder */
function findTypeScriptFiles(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      return SKIPPED_FOLDERS.has(entry.name) ? [] : findTypeScriptFiles(path);
    }
    return entry.name.endsWith('.ts') ? [path] : [];
  });
}

/** Import declarations, including the ones Prettier split over several lines */
const IMPORTS = /^import\b[^;]*;/gm;
const withoutImports = (code: string): string => code.replace(IMPORTS, '');
const wrappedImports = (code: string): string[] => (code.match(IMPORTS) ?? []).filter(text => text.includes('\n'));
const hasComment = (text: string): boolean => /\/\/|\/\*/.test(text.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, ''));

const FILES = [...findTypeScriptFiles(join(ROOT, 'projects')), ...findTypeScriptFiles(join(ROOT, 'web'))];

describe('real-world files', () => {
  it('should find the repository files', () => {
    expect(FILES.length).toBeGreaterThan(50);
  });

  it.each(FILES.map(file => [relative(ROOT, file), file]))('%s', async (_name, file) => {
    const source = readFileSync(file, 'utf8');
    const plain = await format(source, { ...OPTIONS, filepath: file });
    const formatted = await format(source, { ...OPTIONS, filepath: file, plugins: [plugin] });

    // No import is wrapped, except ones with comments, which Prettier handles
    expect(wrappedImports(formatted).filter(text => !hasComment(text))).toEqual([]);
    // Everything that isn't an import is exactly what Prettier produces
    expect(withoutImports(formatted)).toBe(withoutImports(plain));
    // Formatting again changes nothing
    expect(await format(formatted, { ...OPTIONS, filepath: file, plugins: [plugin] })).toBe(formatted);
  });
});
