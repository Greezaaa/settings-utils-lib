import { SU_THEME_PALETTES, ThemeCssVariables } from '@su-labs/theme';
import { SITE_THEMES } from './site-theme';

export type GameThemeId = 'light' | 'dark' | 'ocean' | 'party' | 'night' | 'sunset' | 'candy' | 'copper';

/**
 * Colours of the game boards, a site-wide setting (see BoardColours). They apply to each board only, with
 * @su-labs/theme's `target` option, so the rest of the page keeps the site theme. Every theme is a palette of
 * text, background and accent; boards mix their other colours from these (see `.game-board` in styles.scss).
 * Names are translated.
 */
export interface GameTheme {
  readonly id: GameThemeId;
  readonly palette: ThemeCssVariables;
}

// Kids' palettes, picked for contrast: text on background at least 7.7:1, buttons at least 4.5:1.
const OCEAN: ThemeCssVariables = { color: '#8ecae6', background: '#023047', 'main-accent': '#ffb703' };
const PARTY: ThemeCssVariables = { color: '#ffffff', background: '#3d0e7e', 'main-accent': '#ffbe0b' };
const NIGHT: ThemeCssVariables = { color: '#b8f2e6', background: '#023047', 'main-accent': '#f15bb5' };

export const GAME_THEMES: readonly GameTheme[] = [
  { id: 'light', palette: SITE_THEMES.light },
  { id: 'dark', palette: SITE_THEMES.dark },
  { id: 'ocean', palette: OCEAN },
  { id: 'party', palette: PARTY },
  { id: 'night', palette: NIGHT },
  { id: 'sunset', palette: SU_THEME_PALETTES.sunset },
  { id: 'candy', palette: SU_THEME_PALETTES.candy },
  { id: 'copper', palette: SU_THEME_PALETTES.copper },
];

export const isGameThemeId = (value: unknown): value is GameThemeId => GAME_THEMES.some(({ id }) => id === value);

export function getGameTheme(id: GameThemeId): GameTheme {
  const theme = GAME_THEMES.find((item) => item.id === id);
  if (!theme) {
    throw new Error(`Unknown game theme: ${id}`);
  }
  return theme;
}
