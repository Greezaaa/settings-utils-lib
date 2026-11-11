import { inject, Injectable, signal } from '@angular/core';
import { isSuBaseThemeName, SuBaseThemeName, SuThemeConfig, SuThemeService } from '@su-labs/theme';
import { SHARED_SETTINGS } from './shared-settings';

/** Theme colors of the site, applied by @su-labs/theme as --su-theme-* variables */
export const SITE_THEMES = {
  light: {
    color: '#2f3437',
    background: '#fbfbfa',
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
 * Wraps `SuThemeService` so the header switch and the theme demo share one reactive
 * preference (including 'system'), not only the resolved theme.
 */
@Injectable({ providedIn: 'root' })
export class SiteTheme {
  private readonly themeService = inject(SuThemeService);
  private readonly preferenceSignal = signal<SuBaseThemeName>('system');

  /** The option the visitor picked, may be 'system' */
  readonly preference = this.preferenceSignal.asReadonly();

  /** Key of the saved preference, shared with the other su-labs site (also read by the inline script in index.html) */
  readonly storageKey = SHARED_SETTINGS.themeKey;

  /** The theme actually shown ('light', 'dark' or 'contrast') */
  readonly resolved = this.themeService.theme;

  /** Apply the saved theme, or follow the operating system */
  init(): void {
    this.themeService.init(this.config(SITE_THEMES));
    // This site offers no palettes, so a saved one (from su-labs.dev) has already fallen back to a base theme
    const preference = this.themeService.getUserPreference();
    this.preferenceSignal.set(isSuBaseThemeName(preference) ? preference : 'system');
  }

  set(theme: SuBaseThemeName): void {
    this.themeService.setTheme(theme);
    this.preferenceSignal.set(theme);
  }

  private config(themes: SuThemeConfig['themes']): SuThemeConfig {
    return { defaultTheme: 'system', storage: SHARED_SETTINGS.storage, storageKey: this.storageKey, themes };
  }
}
