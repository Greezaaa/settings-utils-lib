import { inject, Injectable, signal } from '@angular/core';
import { SuThemeConfig, SuThemeName, SuThemeService, ThemeCssVariables } from '@su-labs/theme';
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
  private readonly preferenceSignal = signal<SuThemeName>('system');

  /** The option the visitor picked, may be 'system' */
  readonly preference = this.preferenceSignal.asReadonly();

  /** Key of the saved preference, shared with the other su-labs site (also read by the inline script in index.html) */
  readonly storageKey = SHARED_SETTINGS.themeKey;

  /** The theme actually shown ('light', 'dark' or 'contrast') */
  readonly resolved = this.themeService.theme;

  /** Apply the saved theme, or follow the operating system */
  init(): void {
    this.themeService.init(this.config(SITE_THEMES));
    this.preferenceSignal.set(this.themeService.getUserPreference());
  }

  /**
   * Show the library's 'custom' theme with the given variables, for this visit only.
   * It is not saved, so a reload returns to the visitor's saved theme.
   * `init()` is how the library takes new theme variables; it keeps the saved preference.
   */
  applyCustom(variables: ThemeCssVariables): void {
    this.themeService.init(this.config({ ...SITE_THEMES, custom: variables }));
    this.themeService.setTheme('custom', false);
    this.preferenceSignal.set('custom');
  }

  /**
   * Show a theme for this visit only, without changing the saved preference.
   * `restore()` brings the saved theme back.
   */
  show(theme: SuThemeName): void {
    this.themeService.setTheme(theme, false);
    this.preferenceSignal.set(theme);
  }

  /** Go back to the visitor's saved theme after `show()` or `applyCustom()` */
  restore(): void {
    this.init();
  }

  /** Switch and remember a theme */
  set(theme: SuThemeName): void {
    this.themeService.setTheme(theme);
    this.preferenceSignal.set(theme);
  }

  private config(themes: SuThemeConfig['themes']): SuThemeConfig {
    return { defaultTheme: 'system', storage: SHARED_SETTINGS.storage, storageKey: this.storageKey, themes };
  }
}
