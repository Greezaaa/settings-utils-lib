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

  /** Optional CSS variable overrides */
  variables?: ThemeCssVariables;
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

/** Optional enum if you prefer constants */
export const SuThemeDefaults: Readonly<ThemeCssVariables> = {
  color: '#333',
  background: '#fff',
  'main-accent': '#007bff',
  'second-accent': '#6c757d',
  'third-accent': '#28a745',
};
