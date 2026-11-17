import { contrastRatio, hexToRgb, oklchToRgb, Rgb, rgbToHex, rgbToOklch } from '../../shared/color';

export interface ContrastCheck {
  readonly use: string;
  readonly level: 'AA' | 'AAA';
  readonly minimum: number;
}

export const CONTRAST_CHECKS: readonly ContrastCheck[] = [
  { use: 'Normal text', level: 'AA', minimum: 4.5 },
  { use: 'Normal text', level: 'AAA', minimum: 7 },
  { use: 'Large text, 24px or bold 18.66px', level: 'AA', minimum: 3 },
  { use: 'Large text, 24px or bold 18.66px', level: 'AAA', minimum: 4.5 },
  { use: 'Icons, borders and form controls', level: 'AA', minimum: 3 },
];

export const SUGGESTION_TARGETS: readonly ContrastCheck[] = [CONTRAST_CHECKS[0], CONTRAST_CHECKS[1]];

const SEARCH_STEPS = 24;

const black: Rgb = { r: 0, g: 0, b: 0 };

const roundTrip = (rgb: Rgb): Rgb => hexToRgb(rgbToHex(rgb)) ?? black;

export const ratioBetween = (first: string, second: string): number =>
  contrastRatio(hexToRgb(first) ?? black, hexToRgb(second) ?? black);

export const nearestPassing = (foreground: string, background: string, minimum: number): string | undefined => {
  const base = rgbToOklch(hexToRgb(foreground) ?? black);
  const backdrop = hexToRgb(background) ?? black;
  const colorAt = (lightness: number): Rgb => roundTrip(oklchToRgb({ ...base, l: lightness }));
  const passes = (lightness: number): boolean => contrastRatio(colorAt(lightness), backdrop) >= minimum;
  if (passes(base.l)) {
    return rgbToHex(colorAt(base.l));
  }
  const candidates = [0, 1]
    .filter((end) => passes(end))
    .map((end) => {
      let failing = base.l;
      let passing = end;
      for (let step = 0; step < SEARCH_STEPS; step++) {
        const middle = (failing + passing) / 2;
        if (passes(middle)) {
          passing = middle;
        } else {
          failing = middle;
        }
      }
      return passing;
    })
    .sort((a, b) => Math.abs(a - base.l) - Math.abs(b - base.l));
  return candidates.length > 0 ? rgbToHex(colorAt(candidates[0])) : undefined;
};
