import { inject, Injectable, signal } from '@angular/core';
import { isSuBaseThemeName, SU_PALETTE_NAMES, SU_THEME_PALETTES, SuThemeConfig, SuThemeName, SuThemeService, ThemeCssVariables } from '@su-labs/theme';
import { SHARED_SETTINGS } from './shared-settings';

/** Theme colors of the site, applied by @su-labs/theme as --su-theme-* variables */
export const SITE_THEMES = {
  light: {
    color: '#2f3437',
    background: '#f6f6f4',
    'main-accent': '#111111',
    'second-accent': '#787774',
    'third-accent': '#346538',
  },
  dark: {
    color: '#e3e2e0',
    background: '#191919',
    'main-accent': '#f5f5f4',
    'second-accent': '#9b9a97',
    'third-accent': '#a7cfa3',
  },
  contrast: {
    color: '#000000',
    background: '#ffffff',
    'main-accent': '#000000',
    'second-accent': '#000000',
    'third-accent': '#000000',
  },
} satisfies NonNullable<SuThemeConfig['themes']>;

/**
 * Site-wide theme state.
 *
 * Wraps `SuThemeService` so the header picker shares one reactive preference (including 'system'), not only the
 * resolved theme. Every ready-made palette of @su-labs/theme is offered too, for the whole page.
 */
@Injectable({ providedIn: 'root' })
export class SiteTheme {
  private readonly themeService = inject(SuThemeService);
  private readonly preferenceSignal = signal<SuThemeName>('system');

  /** The themes the picker offers: the site's own, then every ready-made palette */
  readonly choices: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast', ...SU_PALETTE_NAMES];

  /** The option the visitor picked, may be 'system' */
  readonly preference = this.preferenceSignal.asReadonly();

  /** Key of the saved preference, shared with the other su-labs site (also read by the inline script in index.html) */
  readonly storageKey = SHARED_SETTINGS.themeKey;

  /** The theme actually shown ('light', 'dark', 'contrast' or a palette) */
  readonly resolved = this.themeService.theme;

  /** Apply the saved theme, or follow the operating system */
  init(): void {
    this.themeService.init(this.config(SITE_THEMES));
    this.preferenceSignal.set(this.themeService.getUserPreference());
  }

  /** A theme's text, background and accent, for its swatch in the picker; 'system' shows the theme it resolves to */
  coloursOf(theme: SuThemeName): ThemeCssVariables {
    const shown = theme === 'system' ? this.resolved() : theme;
    if (!isSuBaseThemeName(shown)) {
      return SU_THEME_PALETTES[shown].variables;
    }
    return shown === 'dark' || shown === 'contrast' ? SITE_THEMES[shown] : SITE_THEMES.light;
  }

  set(theme: SuThemeName): void {
    this.themeService.setTheme(theme);
    this.preferenceSignal.set(theme);
  }

  private config(themes: SuThemeConfig['themes']): SuThemeConfig {
    return {
      defaultTheme: 'system',
      storage: SHARED_SETTINGS.storage,
      storageKey: this.storageKey,
      themes,
      palettes: SU_PALETTE_NAMES,
    };
  }
}
