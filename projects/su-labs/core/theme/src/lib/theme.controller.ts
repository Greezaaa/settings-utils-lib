import { createSuStore, isBrowser, SuReadableStore } from '@su-labs/core';
import { SuThemeConfig, SuThemeName, ThemeCssVariables } from './theme.types';

/** Media query used to detect the operating system's dark mode */
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Default CSS variables applied for each theme unless overridden in the config */
const DEFAULT_THEMES: Record<SuThemeName, ThemeCssVariables> = {
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
  contrast: {
    color: '#000',
    background: '#fff',
    'main-accent': '#ff0000',
  },
  custom: {},
  system: {},
};

/**
 * Framework-agnostic theme manager.
 *
 * Resolves the active theme (including 'system'), applies it to the document as a
 * `data-theme` attribute and CSS variables, persists the user's choice in localStorage,
 * and exposes the resolved theme as a reactive store.
 * Safe to import in Node: browser-only work is skipped when there is no DOM.
 */
export class SuThemeController {
  /** Configuration for the theme, provided during initialization */
  private config: SuThemeConfig = {};

  /** CSS variable prefix, can be customized */
  private cssVarPrefix = '--su-theme-';

  /** localStorage key for storing user preference, can be customized */
  private storageKey = 'su:theme';

  /** User selected theme (can be 'system') */
  private userPreference: SuThemeName = 'light';

  /** Current resolved theme ('light' | 'dark' | 'contrast' | 'custom') */
  private readonly themeStore = createSuStore<SuThemeName>('light');

  /** Reactive, read-only access to the resolved theme */
  readonly theme: SuReadableStore<SuThemeName> = this.themeStore.asReadonly();

  /** System media query listener callback */
  private systemChangeHandler: ((event: MediaQueryListEvent) => void) | null = null;

  /** MediaQueryList instance for system theme changes */
  private mediaQuery?: MediaQueryList;

  /**
   * Initialize with optional configuration and apply the saved or default theme.
   * @param config Optional configuration object.
   */
  public init(config?: SuThemeConfig): void {
    this.config = { ...this.config, ...config };
    this.cssVarPrefix = this.config.cssVarPrefix ?? this.cssVarPrefix;
    this.storageKey = this.config.storageKey ?? this.storageKey;

    const savedPreference = isBrowser() ? (localStorage.getItem(this.storageKey) as SuThemeName | null) : null;
    this.userPreference = savedPreference ?? this.config.defaultTheme ?? 'system';

    this.setTheme(this.userPreference, false);
  }

  /**
   * Get the currently active, resolved theme.
   * @returns The resolved theme name ('light', 'dark', 'contrast', 'custom').
   */
  public getTheme(): SuThemeName {
    return this.themeStore.get();
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
    if (theme !== 'system') {
      this.stopListeningToSystemChanges();
    }

    this.userPreference = theme;
    this.applyResolvedTheme(theme === 'system' ? this.resolveSystemTheme() : theme);

    if (persist && isBrowser()) {
      localStorage.setItem(this.storageKey, theme);
    }

    if (theme === 'system') {
      this.listenToSystemChanges();
    }
  }

  /** Stop listening to system theme changes and release browser resources */
  public destroy(): void {
    this.stopListeningToSystemChanges();
  }

  /**
   * Update the store and apply the theme to the document.
   * @param theme The resolved theme to apply.
   */
  private applyResolvedTheme(theme: SuThemeName): void {
    this.themeStore.set(theme);

    if (!isBrowser()) {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    this.applyThemeVariables(theme);
  }

  /**
   * Resolve the current system theme using prefers-color-scheme.
   * @returns 'dark' if system prefers dark mode, otherwise 'light'.
   */
  private resolveSystemTheme(): SuThemeName {
    return isBrowser() && window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
  }

  /**
   * Listen to system theme changes and automatically update the theme.
   * Only active when user preference is 'system'.
   */
  private listenToSystemChanges(): void {
    if (this.mediaQuery || !isBrowser()) {
      return;
    }

    this.mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    this.systemChangeHandler = (event: MediaQueryListEvent): void => {
      if (this.userPreference === 'system') {
        this.applyResolvedTheme(event.matches ? 'dark' : 'light');
      }
    };
    this.mediaQuery.addEventListener('change', this.systemChangeHandler);
  }

  /** Stop listening to system theme changes */
  private stopListeningToSystemChanges(): void {
    if (this.mediaQuery && this.systemChangeHandler) {
      this.mediaQuery.removeEventListener('change', this.systemChangeHandler);
      this.systemChangeHandler = null;
      this.mediaQuery = undefined;
    }
  }

  /**
   * Apply CSS variables for the given theme, merging defaults with config overrides.
   * @param theme The theme whose variables should be applied.
   */
  private applyThemeVariables(theme: SuThemeName): void {
    const variablesToApply = {
      ...DEFAULT_THEMES[theme],
      ...(this.config.themes?.[theme] ?? {}),
    };

    for (const [key, value] of Object.entries(variablesToApply)) {
      if (value) {
        document.documentElement.style.setProperty(`${this.cssVarPrefix}${key}`, value);
      }
    }
  }
}
