import { Injectable, signal, WritableSignal, OnDestroy, computed } from '@angular/core';
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
  /** Configuration for the theme, provided during initialization */
  private suThemeConfig: SuThemeConfig = {};

  /** CSS variable prefix, can be customized */
  private cssVarPrefix = '--su-theme-';

  /** localStorage key for storing user preference, can be customized */
  private storageKey = 'su:theme';

  /** User selected theme (can be 'system') */
  private userPreference: SuThemeName = 'light';

  /** Current resolved theme signal ('light' | 'dark' | 'contrast' | 'custom') */
  private currentThemeSignal: WritableSignal<SuThemeName> = signal('light');

  /** Read-only access to the resolved theme signal */
  readonly theme = this.currentThemeSignal.asReadonly();

  /** System media query listener callback */
  private systemChangeHandler: ((event: MediaQueryListEvent) => void) | null = null;

  /** MediaQueryList instance for system theme changes */
  private mediaQuery?: MediaQueryList;

  /**
   * Initialize the service with optional configuration.
   * Should be called from APP_INITIALIZER for default setup.
   * @param config Optional configuration object.
   */
  public init(config?: SuThemeConfig): void {
    // Apply configuration and defaults
    this.suThemeConfig = { ...this.suThemeConfig, ...config };
    this.cssVarPrefix = this.suThemeConfig.cssVarPrefix ?? this.cssVarPrefix;
    this.storageKey = this.suThemeConfig.storageKey ?? this.storageKey;

    // Set user preference from localStorage or default
    this.userPreference = (localStorage.getItem(this.storageKey) as SuThemeName | null) ?? this.suThemeConfig.defaultTheme ?? 'system';

    // Set the initial theme based on the resolved preference
    this.setTheme(this.userPreference, false);
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
    // Stop listening to system changes if we are setting a non-system theme
    if (theme !== 'system') {
      this.stopListeningToSystemChanges();
    }

    // Resolve the final theme name
    const resolvedTheme: SuThemeName = theme === 'system' ? this.resolveSystemTheme() : theme;

    // Update internal state and signals
    this.userPreference = theme;
    this.currentThemeSignal.set(resolvedTheme);

    // Apply the theme to the document and manage system listeners
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    this.applyThemeVariables(resolvedTheme);

    // Persist preference to localStorage
    if (persist) {
      localStorage.setItem(this.storageKey, theme);
    }

    // Start listening for system changes if the new preference is 'system'
    if (theme === 'system') {
      this.listenToSystemChanges();
    }
  }

  /**
   * Resolve the current system theme using prefers-color-scheme.
   * @returns 'dark' if system prefers dark mode, otherwise 'light'.
   */
  private resolveSystemTheme(): SuThemeName {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Listen to system theme changes and automatically update the theme.
   * Only active when user preference is 'system'.
   */
  private listenToSystemChanges(): void {
    // Only set up the listener if it's not already active
    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemChangeHandler = (event: MediaQueryListEvent): void => {
        // Only react if the user preference is still 'system'
        if (this.userPreference === 'system') {
          this.currentThemeSignal.set(event.matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', this.currentThemeSignal());
          this.applyThemeVariables(this.currentThemeSignal());
        }
      };
      this.mediaQuery.addEventListener('change', this.systemChangeHandler);
    }
  }

  /**
   * Stop listening to system theme changes.
   * Should be called when the service is destroyed or theme is no longer 'system'.
   */
  private stopListeningToSystemChanges(): void {
    if (this.mediaQuery && this.systemChangeHandler) {
      this.mediaQuery.removeEventListener('change', this.systemChangeHandler);
      this.systemChangeHandler = null;
      this.mediaQuery = undefined;
    }
  }

  /**
   * Apply CSS variables for the given theme.
   * This method applies default variables if they are not overridden in the config.
   * @param theme The theme whose variables should be applied.
   */
  private applyThemeVariables(theme: SuThemeName): void {
    // Map of default variables for light and dark themes
    const defaultThemes: Record<SuThemeName, ThemeCssVariables> = {
      light: {
        color: '#333',
        background: '#fff',
        'main-accent': '#007bff',
        'second-accent': '#6c757d',
        'third-accent': '#28a745',
      },
      dark: {
        color: '#f0f0f0',
        background: '#1a1a1a',
        'main-accent': '#38a8e1',
        'second-accent': '#a8b0b5',
        'third-accent': '#2ee057',
      },
      // You can add more default themes here
      contrast: {
        color: '#000',
        background: '#fff',
        'main-accent': '#ff0000',
      },
      custom: {},
      system: {},
    };

    // Use a combination of default and user-defined variables
    const variablesToApply = {
      ...defaultThemes[theme],
      ...(this.suThemeConfig.themes?.[theme] ?? {}),
    };

    // Apply the variables to the root element
    for (const [key, value] of Object.entries(variablesToApply)) {
      if (value) {
        document.documentElement.style.setProperty(
          `${this.cssVarPrefix}${key}`,
          value,
        );
      }
    }
  }

  /** Angular lifecycle hook for service destruction */
  ngOnDestroy(): void {
    this.stopListeningToSystemChanges();
  }
}