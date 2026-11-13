import { inject, Injectable, signal } from '@angular/core';
import { SU_PALETTE_NAMES, SuThemeConfig, SuThemeName, SuThemeService, ThemeCssVariables } from '@su-labs/theme';
import { SHARED_SETTINGS } from './shared-settings';

const SITE_THEMES: NonNullable<SuThemeConfig['themes']> = {
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
};

@Injectable({ providedIn: 'root' })
export class SiteTheme {
  private readonly themeService = inject(SuThemeService);
  private readonly preferenceSignal = signal<SuThemeName>('system');

  readonly preference = this.preferenceSignal.asReadonly();

  readonly storageKey = SHARED_SETTINGS.themeKey;

  readonly resolved = this.themeService.theme;

  init(): void {
    this.themeService.init(this.config(SITE_THEMES));
    this.preferenceSignal.set(this.themeService.getUserPreference());
  }

  applyCustom(variables: ThemeCssVariables): void {
    this.themeService.init(this.config({ ...SITE_THEMES, custom: variables }));
    this.themeService.setTheme('custom', false);
    this.preferenceSignal.set('custom');
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
