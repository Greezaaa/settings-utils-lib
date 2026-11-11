/*
 * Public API Surface of theme
 */

export * from './lib/theme.service';
export type {
  SuBaseThemeName,
  SuPaletteName,
  SuThemePalette,
  SuThemeScheme,
  SuThemeConfig,
  SuThemeName,
  ThemeCssVariables,
} from '@su-labs/core/theme';
export { isSuBaseThemeName, SU_BASE_THEME_NAMES, SU_PALETTE_NAMES, SU_THEME_PALETTES } from '@su-labs/core/theme';
