import { Injectable, signal, WritableSignal, OnDestroy } from '@angular/core';
import { SuThemeConfig, SuThemeName, ThemeCssVariables } from './theme.types';

/**
 * Service for managing application themes.
 *
 * Provides reactive theme state via signals and methods to set/get the theme.
 * Supports user preference, system-based themes, and custom CSS variable overrides.
 */
@Injectable({
  providedIn: 'root',
})
export class SuThemeService implements OnDestroy {
  /** Configuration for the theme */
  private suThemeConfig: SuThemeConfig = {};

  /** CSS variable prefix */
  private cssVarPrefix = '--su-theme-';

  /** localStorage key for storing user preference */
  private storageKey = 'su-theme';

  /** User selected theme (can be 'system') */
  private userPreference: SuThemeName = 'light';

  /** Current resolved theme signal ('light' | 'dark' | 'contrast' | 'custom') */
  private currentThemeSignal: WritableSignal<SuThemeName> =
    signal<SuThemeName>('light');

  /** Read-only access to the resolved theme signal */
  readonly theme = this.currentThemeSignal.asReadonly();

  /** System media query listener callback */
  private systemChangeHandler: ((event: MediaQueryListEvent) => void) | null =
    null;

  /** MediaQueryList instance for system theme changes */
  private mediaQuery?: MediaQueryList;

  /**
   * Initialize the service with optional configuration.
   * Should be called from APP_INITIALIZER for default setup.
   * @param config Optional configuration object.
   */
  public init(config?: SuThemeConfig): void {
    if (config) {
      this.suThemeConfig = config;
    }

    this.cssVarPrefix = this.suThemeConfig.cssVarPrefix ?? this.cssVarPrefix;
    this.storageKey = this.suThemeConfig.storageKey ?? this.storageKey;
    this.userPreference =
      (localStorage.getItem(this.storageKey) as SuThemeName | null) ??
      this.suThemeConfig.defaultTheme ??
      'system';

    // Set the initial theme
    this.updateTheme(this.userPreference);

    // Listen to system changes if preference is 'system'
    if (this.userPreference === 'system') {
      this.listenToSystemChanges();
    }

    // Apply CSS variables
    if (this.suThemeConfig.variables) {
      this.applyCssVariables(this.suThemeConfig.variables);
    }
  }

  /**
   * Get the currently active, resolved theme.
   * @returns The resolved theme name ('light', 'dark', 'contrast', 'custom').
   */
  public getTheme(): SuThemeName {
    return this.currentThemeSignal();
  }

  /**
   * Get the user's theme preference (may be 'system').
   * @returns The user preference ('light', 'dark', 'contrast', 'custom', 'system').
   */
  public getUserPreference(): SuThemeName {
    return this.userPreference;
  }

  /**
   * Set a new theme.
   * @param theme The theme to set ('light', 'dark', 'contrast', 'custom', 'system').
   * @param persist Whether to store the preference in localStorage (default: true).
   */
  public setTheme(theme: SuThemeName, persist: boolean = true): void {
    this.userPreference = theme;
    this.updateTheme(theme);

    if (persist) {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  /**
   * Update the resolved theme based on user preference or system settings.
   * @param theme User preference or 'system'.
   */
  private updateTheme(theme: SuThemeName): void {
    const resolved: SuThemeName =
      theme === 'system' ? this.resolveSystemTheme() : theme;

    this.currentThemeSignal.set(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }

  /**
   * Resolve the current system theme using prefers-color-scheme.
   * @returns 'dark' if system prefers dark mode, otherwise 'light'.
   */
  private resolveSystemTheme(): SuThemeName {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Listen to system theme changes and automatically update the theme.
   * Only active when user preference is 'system'.
   */
  private listenToSystemChanges(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemChangeHandler = (): void => {
      if (this.userPreference === 'system') {
        this.updateTheme('system');
      }
    };
    this.mediaQuery.addEventListener('change', this.systemChangeHandler);
  }

  /**
   * Stop listening to system theme changes.
   * Should be called on service destroy to prevent memory leaks.
   */
  public destroy(): void {
    if (this.mediaQuery && this.systemChangeHandler) {
      this.mediaQuery.removeEventListener('change', this.systemChangeHandler);
      this.systemChangeHandler = null;
      this.mediaQuery = undefined;
    }
  }

  /** Angular lifecycle hook for service destruction */
  ngOnDestroy(): void {
    this.destroy();
  }

  /**
   * Apply custom CSS variables to :root.
   * @param vars Key-value pairs of CSS variables.
   */
  private applyCssVariables(vars: ThemeCssVariables): void {
    for (const [key, value] of Object.entries(vars)) {
      if (value) {
        document.documentElement.style.setProperty(
          this.cssVarPrefix + key,
          value,
        );
      }
    }
  }
}
