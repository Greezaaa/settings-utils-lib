import { ThemeCssVariables } from './theme.types';

/** Ready-made palettes, each a background, a text colour and an accent (roughly 60%, 30% and 10% of a page) */
export const SU_PALETTE_NAMES = [
  'sunset',
  'candy',
  'copper',
  'solar',
  'neon',
  'sunflower',
  'tomato',
  'blossom',
  'ember',
  'storm',
  'racing',
] as const;
export type SuPaletteName = (typeof SU_PALETTE_NAMES)[number];

/** Whether a theme is light or dark, so a site's own colours (status colours, shadows…) can follow it */
export type SuThemeScheme = 'light' | 'dark';

/** A ready-made palette: its scheme and its `--su-theme-*` variables */
export interface SuThemePalette {
  readonly scheme: SuThemeScheme;
  readonly variables: ThemeCssVariables;
}

/**
 * Every palette keeps text at least 7:1 on its background, and its `button-text` at least 4.5:1 on its accent, so
 * the accent works as a button colour. Bright accents on light backgrounds take dark button text.
 * A site offers the ones it wants with the theme config's `palettes` option.
 */
export const SU_THEME_PALETTES: Readonly<Record<SuPaletteName, SuThemePalette>> = {
  /** Midnight blue, cream and amber */
  sunset: {
    scheme: 'dark',
    variables: {
      color: '#f4d6b0',
      background: '#0b132b',
      'main-accent': '#d97706',
      'second-accent': '#5bc0de',
      'button-text': '#0b132b',
    },
  },
  /** Near black, white and pink */
  candy: {
    scheme: 'dark',
    variables: {
      color: '#f1f5f9',
      background: '#121212',
      'main-accent': '#ec4899',
      'second-accent': '#64748b',
      'button-text': '#121212',
    },
  },
  /** Black, teal and copper; teal is the text, as a teal background would leave copper at 2.9:1 */
  copper: {
    scheme: 'dark',
    variables: {
      color: '#7fb3b8',
      background: '#0a0f14',
      'main-accent': '#c6601f',
      'second-accent': '#eadcc8',
      'button-text': '#0a0f14',
    },
  },
  /** Porcelain, midnight navy and solar orange */
  solar: {
    scheme: 'light',
    variables: {
      color: '#1b2440',
      background: '#f2efea',
      'main-accent': '#ff6b1a',
      'second-accent': '#1b2440',
      'button-text': '#1b2440',
    },
  },
  /** Graphite, silver mist and hyper pink */
  neon: {
    scheme: 'dark',
    variables: {
      color: '#d4d6db',
      background: '#232326',
      'main-accent': '#ff2d78',
      'second-accent': '#a9adb5',
      'button-text': '#111113',
    },
  },
  /** Midnight navy, powder blue and sunflower yellow */
  sunflower: {
    scheme: 'dark',
    variables: {
      color: '#c4d6ec',
      background: '#16213e',
      'main-accent': '#ffc20d',
      'second-accent': '#8fb0d6',
      'button-text': '#16213e',
    },
  },
  /** Oat milk, forest green and tomato red */
  tomato: {
    scheme: 'light',
    variables: {
      color: '#24452f',
      background: '#efe6d8',
      'main-accent': '#f2462e',
      'second-accent': '#24452f',
      'button-text': '#1a1a1a',
    },
  },
  /** Butter cream, forest green and hot pink */
  blossom: {
    scheme: 'light',
    variables: {
      color: '#1e3a2b',
      background: '#f7ecd3',
      'main-accent': '#ff3ea5',
      'second-accent': '#1e3a2b',
      'button-text': '#111111',
    },
  },
  /** Midnight black, electric blue and sunset orange */
  ember: {
    scheme: 'dark',
    variables: {
      color: '#e6eaf3',
      background: '#0d0f14',
      'main-accent': '#ff7a1a',
      'second-accent': '#3d6bff',
      'button-text': '#0d0f14',
    },
  },
  /** Storm grey, near black and safety orange; a darker grey than usual, where the orange still stands out */
  storm: {
    scheme: 'dark',
    variables: {
      color: '#f1f2f4',
      background: '#3f444b',
      'main-accent': '#ff5f00',
      'second-accent': '#141416',
      'button-text': '#111111',
    },
  },
  /** Polar white, glacier blue and racing red */
  racing: {
    scheme: 'light',
    variables: {
      color: '#3b5266',
      background: '#f7f9fb',
      'main-accent': '#e4002b',
      'second-accent': '#9cc3dd',
      'button-text': '#ffffff',
    },
  },
};
