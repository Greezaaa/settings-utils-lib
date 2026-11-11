import { ThemeCssVariables } from './theme.types';

/** Ready-made dark palettes, each a text colour, a background and an accent */
export const SU_PALETTE_NAMES = ['sunset', 'candy', 'copper'] as const;
export type SuPaletteName = (typeof SU_PALETTE_NAMES)[number];

/**
 * Picked for contrast on their own background: text at least 8:1, and the accent at least 4.5:1, so it works as a
 * button colour with the background as its text. Pass one as a theme's CSS variables, e.g.
 * `themes: { custom: SU_THEME_PALETTES.sunset }`.
 */
export const SU_THEME_PALETTES: Readonly<
  Record<SuPaletteName, ThemeCssVariables>
> = {
  /** Midnight blue, cream and amber */
  sunset: {
    color: '#f4d6b0',
    background: '#0b132b',
    'main-accent': '#d97706',
    'second-accent': '#5bc0de',
  },
  /** Near black, white and pink */
  candy: {
    color: '#f1f5f9',
    background: '#121212',
    'main-accent': '#ec4899',
    'second-accent': '#64748b',
  },
  /** Black, teal and copper; teal is the text, as a teal background would leave copper at 2.9:1 */
  copper: {
    color: '#7fb3b8',
    background: '#0a0f14',
    'main-accent': '#c6601f',
    'second-accent': '#eadcc8',
  },
};
