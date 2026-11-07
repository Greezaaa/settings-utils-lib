import { SuStorage } from '@su-labs/core';

/** Available theme names */
export type SuThemeName = 'light' | 'dark' | 'contrast' | 'custom' | 'system';

/** Theme configuration */
export interface SuThemeConfig {
  /** Key the selected theme is saved under */
  storageKey?: string;

  /**
   * Where the selected theme is saved (default: `localStorage`).
   * Pass `createSuCookieStorage({ domain })` to share it with every site on that domain.
   */
  storage?: SuStorage;

  /**
   * Element the theme is applied to, as a `data-theme` attribute and CSS variables (default: `<html>`).
   * Pass a component's element to theme only that part of the page; its descendants inherit the variables.
   */
  target?: HTMLElement;

  /** CSS variable prefix, applied to all theme variables */
  cssVarPrefix?: string;

  /** Default theme if nothing is saved */
  defaultTheme?: SuThemeName;

  /** Optional CSS variable overrides for specific themes */
  themes?: Partial<Record<SuThemeName, ThemeCssVariables>>;
}

/** Available CSS variables for theming */
export interface ThemeCssVariables {
  color?: string; // --su-theme-color
  background?: string; // --su-theme-background
  'main-accent'?: string; // --su-theme-main-accent
  'second-accent'?: string; // --su-theme-second-accent
  'third-accent'?: string; // --su-theme-third-accent
  [key: string]: string | undefined; // allow future custom variables
}
