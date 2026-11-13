import { SU_PALETTE_NAMES, SU_THEME_PALETTES, SuPaletteName, ThemeCssVariables } from '@su-labs/theme';
import { SITE_THEMES } from './site-theme';

export type GameThemeId = 'light' | 'dark' | 'ocean' | 'party' | 'night' | SuPaletteName;

export interface GameTheme {
  readonly id: GameThemeId;
  readonly palette: ThemeCssVariables;
}

const OCEAN: ThemeCssVariables = { color: '#8ecae6', background: '#023047', 'main-accent': '#ffb703' };
const PARTY: ThemeCssVariables = { color: '#ffffff', background: '#3d0e7e', 'main-accent': '#ffbe0b' };
const NIGHT: ThemeCssVariables = { color: '#b8f2e6', background: '#023047', 'main-accent': '#f15bb5' };

export const GAME_THEMES: readonly GameTheme[] = [
  { id: 'light', palette: SITE_THEMES.light },
  { id: 'dark', palette: SITE_THEMES.dark },
  { id: 'ocean', palette: OCEAN },
  { id: 'party', palette: PARTY },
  { id: 'night', palette: NIGHT },
  ...SU_PALETTE_NAMES.map((id) => ({ id, palette: SU_THEME_PALETTES[id].variables })),
];

export const isGameThemeId = (value: unknown): value is GameThemeId => GAME_THEMES.some(({ id }) => id === value);

export function getGameTheme(id: GameThemeId): GameTheme {
  const theme = GAME_THEMES.find((item) => item.id === id);
  if (!theme) {
    throw new Error(`Unknown game theme: ${id}`);
  }
  return theme;
}
