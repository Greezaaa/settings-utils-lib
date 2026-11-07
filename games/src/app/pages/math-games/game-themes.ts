import { ThemeCssVariables } from '@su-labs/theme';
import { SITE_THEMES } from '../../core/site-theme';

export type GameThemeId = 'light' | 'dark' | 'ocean' | 'party' | 'night';

/**
 * Page colours while playing, applied with @su-labs/theme. Names are translated with the rest of the game.
 * Light and dark are the site's own themes; the others are brighter, for kids, and use its custom theme
 * (the site mixes every other colour from these three, see `:root[data-theme='custom']` in styles.scss).
 */
export interface GameTheme {
  readonly id: GameThemeId;
  /** A site theme to show, or the variables of a custom one */
  readonly palette: 'light' | 'dark' | ThemeCssVariables;
  /** Colours of the swatch on its button */
  readonly preview: ThemeCssVariables;
}

// Kids' palettes, picked for contrast: text on background at least 7.7:1, buttons at least 4.5:1.
const OCEAN: ThemeCssVariables = { color: '#8ecae6', background: '#023047', 'main-accent': '#ffb703' };
const PARTY: ThemeCssVariables = { color: '#ffffff', background: '#3d0e7e', 'main-accent': '#ffbe0b' };
const NIGHT: ThemeCssVariables = { color: '#b8f2e6', background: '#023047', 'main-accent': '#f15bb5' };

export const GAME_THEMES: readonly GameTheme[] = [
  { id: 'light', palette: 'light', preview: SITE_THEMES.light },
  { id: 'dark', palette: 'dark', preview: SITE_THEMES.dark },
  { id: 'ocean', palette: OCEAN, preview: OCEAN },
  { id: 'party', palette: PARTY, preview: PARTY },
  { id: 'night', palette: NIGHT, preview: NIGHT },
];

export const isGameThemeId = (value: unknown): value is GameThemeId => GAME_THEMES.some(({ id }) => id === value);

export function getGameTheme(id: GameThemeId): GameTheme {
  const theme = GAME_THEMES.find((item) => item.id === id);
  if (!theme) {
    throw new Error(`Unknown game theme: ${id}`);
  }
  return theme;
}
