// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { applyReplacements } from './apply-replacements.ts';

describe('applyReplacements', () => {
  it('returns the text unchanged without replacements', () => {
    expect(applyReplacements('abc', [])).toBe('abc');
  });

  it('applies replacements given in any order, by offsets in the original text', () => {
    const text = "import { a } from 'a';\nimport { b } from 'b';\nuse(b);\n";
    const firstLine = { start: 0, end: 23, newText: '' };
    const secondName = { start: 32, end: 33, newText: 'c' };
    expect(applyReplacements(text, [firstLine, secondName])).toBe("import { c } from 'b';\nuse(b);\n");
    expect(applyReplacements(text, [secondName, firstLine])).toBe("import { c } from 'b';\nuse(b);\n");
  });

  it('inserts text where start and end are equal', () => {
    expect(applyReplacements('ac', [{ start: 1, end: 1, newText: 'b' }])).toBe('abc');
  });
});
