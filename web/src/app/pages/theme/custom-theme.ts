import { ThemeCssVariables } from '@su-labs/theme';

export const SAMPLE_CUSTOM_THEME: ThemeCssVariables = {
  background: '#f4ecd8',
  color: '#3b2f2f',
  'main-accent': '#8a4b2a',
  'second-accent': '#7a6a58',
  'third-accent': '#4f6f52',
};

const ALLOWED_KEYS: readonly string[] = ['background', 'color', 'main-accent', 'second-accent', 'third-accent'];

export const MAX_CUSTOM_THEME_LENGTH = 2000;

const MIN_TEXT_CONTRAST = 4.5;

export type Rgba = readonly [number, number, number, number];

export type ColorReader = (value: string) => Rgba | null;

export type CustomThemeResult = { ok: true; variables: ThemeCssVariables } | { ok: false; error: string };

export function parseCustomTheme(json: string, readColor: ColorReader = readCanvasColor): CustomThemeResult {
  if (json.length > MAX_CUSTOM_THEME_LENGTH) {
    return { ok: false, error: `Keep it under ${MAX_CUSTOM_THEME_LENGTH} characters. A theme needs only five colors.` };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'This is not valid JSON. Check for missing quotes or commas.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: 'Use an object of variable names and colors, like { "background": "#ffffff" }.' };
  }

  const variables: ThemeCssVariables = {};
  const colors = new Map<string, Rgba>();
  for (const [name, value] of Object.entries(parsed)) {
    if (!ALLOWED_KEYS.includes(name)) {
      return {
        ok: false,
        error: `"${name}" is not a theme variable. Use ${ALLOWED_KEYS.map((key) => `"${key}"`).join(', ')}.`,
      };
    }
    const rgba = typeof value === 'string' ? readColor(value) : null;
    if (typeof value !== 'string' || !rgba) {
      return { ok: false, error: `"${name}" must be a CSS color, such as "#1f6c9f" or "rgb(31 108 159)".` };
    }
    variables[name] = value;
    colors.set(name, rgba);
  }

  const background = colors.get('background');
  const text = colors.get('color');
  if (!background || !text) {
    return { ok: false, error: 'Add "background" and "color" so the text stays readable.' };
  }
  if (background[3] < 1 || text[3] < 1) {
    return { ok: false, error: '"background" and "color" must be fully opaque.' };
  }
  const ratio = contrastRatio(background, text);
  if (ratio < MIN_TEXT_CONTRAST) {
    return {
      ok: false,
      error:
        `Text contrast is ${ratio.toFixed(1)}:1, below the ${MIN_TEXT_CONTRAST}:1 that WCAG AA asks for normal text. ` +
        'Use a darker text color or a lighter background (or the other way round).',
    };
  }
  return { ok: true, variables };
}

export function contrastRatio(first: Rgba, second: Rgba): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance([red, green, blue]: Rgba): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

let canvasContext: CanvasRenderingContext2D | null | undefined;

function readCanvasColor(value: string): Rgba | null {
  canvasContext ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const context = canvasContext;
  if (!context) {
    return null;
  }

  context.fillStyle = '#000000';
  context.fillStyle = value;
  const afterBlack = context.fillStyle;
  context.fillStyle = '#ffffff';
  context.fillStyle = value;
  if (afterBlack === '#000000' && context.fillStyle === '#ffffff') {
    return null;
  }

  context.clearRect(0, 0, 1, 1);
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue, alpha / 255];
}
