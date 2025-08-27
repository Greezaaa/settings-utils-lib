/** Available theme names */
export type SuThemeName = 'light' | 'dark' | 'contrast' | 'custom' | 'system';

/** Theme configuration */
export interface SuThemeConfig {
  /** localStorage key for storing selected theme */
  storageKey?: string;

  /** CSS variable prefix, applied to all theme variables */
  cssVarPrefix?: string;

  /** Default theme if nothing saved in localStorage */
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
