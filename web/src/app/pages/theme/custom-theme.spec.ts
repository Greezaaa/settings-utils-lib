import { describe, expect, it } from 'vitest';
import { ColorReader, contrastRatio, MAX_CUSTOM_THEME_LENGTH, parseCustomTheme, SAMPLE_CUSTOM_THEME } from './custom-theme';

/**
 * jsdom has no canvas, so colors are read by a stand-in that only knows #rrggbb and 'transparent'.
 * Like the canvas, it rejects anything that isn't a literal color.
 */
const readColor: ColorReader = (value) => {
  if (value === 'transparent') {
    return [0, 0, 0, 0];
  }
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), 1] : null;
};

const parse = (json: string) => parseCustomTheme(json, readColor);
const READABLE = '"background": "#111111", "color": "#eeeeee"';

describe('parseCustomTheme', () => {
  it('should accept the sample theme', () => {
    expect(parse(JSON.stringify(SAMPLE_CUSTOM_THEME))).toEqual({ ok: true, variables: SAMPLE_CUSTOM_THEME });
  });

  it('should reject invalid JSON and values that are not objects', () => {
    expect(parse('{ background: }')).toMatchObject({ ok: false, error: expect.stringContaining('not valid JSON') });
    expect(parse('["#ffffff"]').ok).toBe(false);
    expect(parse('null').ok).toBe(false);
  });

  it('should require readable, opaque text', () => {
    expect(parse('{ "main-accent": "#123456" }')).toMatchObject({ error: 'Add "background" and "color" so the text stays readable.' });
    expect(parse('{ "background": "#ffffff", "color": "transparent" }')).toMatchObject({ error: expect.stringContaining('fully opaque') });
    expect(parse('{ "background": "#ffffff", "color": "#ffffff" }')).toMatchObject({ error: expect.stringContaining('1.0:1') });
  });

  describe('hostile input', () => {
    it.each([
      ['CSS breakout', `{ ${READABLE}, "main-accent": "red; } body { display: none } :root {" }`],
      ['url() to an outside server', '{ "background": "url(https://evil.example/steal)", "color": "#eeeeee" }'],
      ['javascript: URL', '{ "background": "url(javascript:alert(1))", "color": "#eeeeee" }'],
      ['HTML in a value', `{ ${READABLE}, "main-accent": "<img src=x onerror=alert(1)>" }`],
      ['var() reference', '{ "background": "var(--su-theme-color)", "color": "#eeeeee" }'],
      ['nested object', '{ "background": { "a": "#ffffff" }, "color": "#eeeeee" }'],
      ['number value', '{ "background": 0, "color": "#eeeeee" }'],
    ])('should reject a %s as a color', (_name, json) => {
      expect(parse(json)).toMatchObject({ ok: false, error: expect.stringContaining('must be a CSS color') });
    });

    it.each([
      ['__proto__', `{ ${READABLE}, "__proto__": { "polluted": "yes" } }`],
      ['constructor', `{ ${READABLE}, "constructor": "#ffffff" }`],
      ['<script>', `{ ${READABLE}, "<script>alert(1)</script>": "#ffffff" }`],
    ])('should reject the variable name %s', (_name, json) => {
      expect(parse(json)).toMatchObject({ ok: false, error: expect.stringContaining('is not a theme variable') });
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });

    it('should reject oversized input before parsing it', () => {
      const manyKeys = `{ ${READABLE}, ${Array.from({ length: 50_000 }, (_, index) => `"k${index}": "#ffffff"`).join(', ')} }`;
      const deepNesting = '['.repeat(100_000) + ']'.repeat(100_000);

      for (const json of [manyKeys, deepNesting, 'x'.repeat(MAX_CUSTOM_THEME_LENGTH + 1)]) {
        expect(parse(json)).toMatchObject({ ok: false, error: expect.stringContaining(`under ${MAX_CUSTOM_THEME_LENGTH} characters`) });
      }
    });
  });
});

describe('contrastRatio', () => {
  it('should follow the WCAG formula', () => {
    expect(contrastRatio([0, 0, 0, 1], [255, 255, 255, 1])).toBeCloseTo(21);
    expect(contrastRatio([119, 119, 119, 1], [255, 255, 255, 1])).toBeCloseTo(4.48, 1);
  });
});
