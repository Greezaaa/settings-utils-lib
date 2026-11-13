import { inject, Injectable, signal } from '@angular/core';
import { isSuBaseThemeName, SU_PALETTE_NAMES, SU_THEME_PALETTES, SuThemeConfig, SuThemeName, SuThemeService, ThemeCssVariables } from '@su-labs/theme';
import { SHARED_SETTINGS } from './shared-settings';

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

@Injectable({ providedIn: 'root' })
export class SiteTheme {
  private readonly themeService = inject(SuThemeService);
  private readonly preferenceSignal = signal<SuThemeName>('system');

  readonly choices: readonly SuThemeName[] = ['system', 'light', 'dark', 'contrast', ...SU_PALETTE_NAMES];

  readonly preference = this.preferenceSignal.asReadonly();

  readonly storageKey = SHARED_SETTINGS.themeKey;

  readonly resolved = this.themeService.theme;

  init(): void {
    this.themeService.init(this.config(SITE_THEMES));
    this.preferenceSignal.set(this.themeService.getUserPreference());
  }

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
