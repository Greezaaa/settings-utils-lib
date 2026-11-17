import { formatHsl, formatOklch, formatRgb, hexToRgb, oklchToRgb, Rgb, rgbToHex, rgbToOklch } from '../../shared/color';

export interface ColorFormat {
  readonly label: string;
  readonly value: string;
}

export interface Shade {
  readonly step: number;
  readonly hex: string;
  readonly oklch: string;
  readonly dark: boolean;
}

const SHADES: readonly { readonly step: number; readonly lightness: number; readonly chroma: number }[] = [
  { step: 50, lightness: 0.97, chroma: 0.25 },
  { step: 100, lightness: 0.935, chroma: 0.4 },
  { step: 200, lightness: 0.88, chroma: 0.6 },
  { step: 300, lightness: 0.81, chroma: 0.8 },
  { step: 400, lightness: 0.71, chroma: 0.95 },
  { step: 500, lightness: 0.62, chroma: 1 },
  { step: 600, lightness: 0.535, chroma: 1 },
  { step: 700, lightness: 0.455, chroma: 0.9 },
  { step: 800, lightness: 0.38, chroma: 0.8 },
  { step: 900, lightness: 0.32, chroma: 0.7 },
  { step: 950, lightness: 0.24, chroma: 0.6 },
];

const DARK_TEXT_BELOW = 0.62;

const fallback: Rgb = { r: 0, g: 0, b: 0 };

export const colorFormats = (hex: string): readonly ColorFormat[] => {
  const rgb = hexToRgb(hex) ?? fallback;
  return [
    { label: 'Hex', value: hex },
    { label: 'RGB', value: formatRgb(rgb) },
    { label: 'HSL', value: formatHsl(rgb) },
    { label: 'OKLCH', value: formatOklch(rgb) },
  ];
};

export const paletteOf = (hex: string): readonly Shade[] => {
  const base = rgbToOklch(hexToRgb(hex) ?? fallback);
  return SHADES.map(({ step, lightness, chroma }) => {
    const rgb = oklchToRgb({ l: lightness, c: base.c * chroma, h: base.h });
    return { step, hex: rgbToHex(rgb), oklch: formatOklch(rgb), dark: lightness < DARK_TEXT_BELOW };
  });
};

export const cleanName = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'brand';
