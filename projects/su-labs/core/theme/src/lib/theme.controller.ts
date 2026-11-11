import { createSuStore, getSuLocalStorage, isBrowser, SuReadableStore, SuStorage } from '@su-labs/core';
import { SU_PALETTE_NAMES, SU_THEME_PALETTES, SuPaletteName, SuThemeScheme } from './theme.palettes';
import { SuBaseThemeName, SuThemeConfig, SuThemeName, ThemeCssVariables } from './theme.types';

/** Themes every site has */
export const SU_BASE_THEME_NAMES: readonly SuBaseThemeName[] = ['light', 'dark', 'contrast', 'custom', 'system'];

/** Whether a theme name is one of the base themes, e.g. to narrow a preference on a site that offers no palettes */
export const isSuBaseThemeName = (theme: string): theme is SuBaseThemeName =>
  SU_BASE_THEME_NAMES.some((name) => name === theme);

/** Light or dark, for the `data-theme-scheme` attribute; a custom palette has none, as it can be either */
const BASE_SCHEMES: Readonly<Partial<Record<SuBaseThemeName, SuThemeScheme>>> = {
  light: 'light',
  dark: 'dark',
  contrast: 'light',
};

const isPaletteName = (theme: string): theme is SuPaletteName => SU_PALETTE_NAMES.some((name) => name === theme);

/** Media query used to detect the operating system's dark mode */
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Default CSS variables applied for each theme unless overridden in the config */
const DEFAULT_THEMES: Record<SuBaseThemeName, ThemeCssVariables> = {
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
 * Resolves the active theme (including 'system'), applies it to the document (or a configured
 * `target` element) as a `data-theme` attribute (plus `data-theme-scheme`, light or dark, when known) and CSS
 * variables, persists the user's choice (in localStorage unless another `storage` is configured),
 * and exposes the resolved theme as a reactive store. Ready-made palettes are themes too, for sites that list them.
 * Safe to import in Node: browser-only work is skipped when there is no DOM.
 */
export class SuThemeController {
  /** Configuration for the theme, provided during initialization */
  private config: SuThemeConfig = {};

  /** CSS variable prefix, can be customized */
  private cssVarPrefix = '--su-theme-';

  /** Key the user preference is saved under, can be customized */
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

  /** Variables the last theme set, so a theme without one of them doesn't keep the old value */
  private appliedVariables: readonly string[] = [];

  /**
   * Initialize with optional configuration and apply the saved or default theme.
   * @param config Optional configuration object.
   */
  public init(config?: SuThemeConfig): void {
    this.config = { ...this.config, ...config };
    this.cssVarPrefix = this.config.cssVarPrefix ?? this.cssVarPrefix;
    this.storageKey = this.config.storageKey ?? this.storageKey;

    const saved = this.storage()?.getItem(this.storageKey);
    const fallback = this.config.defaultTheme ?? 'system';
    this.userPreference = saved && this.isAvailable(saved) ? saved : fallback;

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
   * Whether a theme can be set here: a base theme, or a palette listed in the config's `palettes`.
   * @param theme Any theme name, e.g. one read back from storage.
   */
  public isAvailable(theme: string): theme is SuThemeName {
    return (
      isSuBaseThemeName(theme) ||
      (isPaletteName(theme) && (this.config.palettes ?? []).includes(theme))
    );
  }

  /** The themes this site offers: the base themes, then its palettes */
  public availableThemes(): SuThemeName[] {
    return [...SU_BASE_THEME_NAMES, ...(this.config.palettes ?? [])];
  }

  /**
   * Set a new theme. A palette the config doesn't list is ignored.
   * @param theme The theme to set ('light', 'dark', 'contrast', 'custom', 'system', or a listed palette).
   * @param persist Whether to save the preference in the configured storage (default: true).
   */
  public setTheme(theme: SuThemeName, persist: boolean = true): void {
    if (!this.isAvailable(theme)) {
      return;
    }
    if (theme !== 'system') {
      this.stopListeningToSystemChanges();
    }

    this.userPreference = theme;
    this.applyResolvedTheme(theme === 'system' ? this.resolveSystemTheme() : theme);

    if (persist) {
      this.storage()?.setItem(this.storageKey, theme);
    }

    if (theme === 'system') {
      this.listenToSystemChanges();
    }
  }

  /** The configured element, or `<html>` in a browser; `null` outside a browser */
  private target(): HTMLElement | null {
    return this.config.target ?? (isBrowser() ? document.documentElement : null);
  }

  /** The configured storage, or localStorage in a browser */
  private storage(): SuStorage | null {
    return this.config.storage ?? getSuLocalStorage();
  }

  /** Stop listening to system theme changes and release browser resources */
  public destroy(): void {
    this.stopListeningToSystemChanges();
  }

  /**
   * Update the store and apply the theme to the target element.
   * @param theme The resolved theme to apply.
   */
  private applyResolvedTheme(theme: SuThemeName): void {
    this.themeStore.set(theme);

    const target = this.target();
    if (!target) {
      return;
    }

    target.setAttribute('data-theme', theme);
    const scheme = isPaletteName(theme) ? SU_THEME_PALETTES[theme].scheme : BASE_SCHEMES[theme];
    if (scheme) {
      target.setAttribute('data-theme-scheme', scheme);
    } else {
      target.removeAttribute('data-theme-scheme');
    }
    this.applyThemeVariables(target, theme);
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
   * @param target The element to set them on.
   * @param theme The theme whose variables should be applied.
   */
  private applyThemeVariables(target: HTMLElement, theme: SuThemeName): void {
    const variablesToApply = {
      ...(isPaletteName(theme) ? SU_THEME_PALETTES[theme].variables : DEFAULT_THEMES[theme]),
      ...(this.config.themes?.[theme] ?? {}),
    };

    for (const key of this.appliedVariables) {
      if (!variablesToApply[key]) {
        target.style.removeProperty(`${this.cssVarPrefix}${key}`);
      }
    }
    for (const [key, value] of Object.entries(variablesToApply)) {
      if (value) {
        target.style.setProperty(`${this.cssVarPrefix}${key}`, value);
      }
    }
    this.appliedVariables = Object.keys(variablesToApply);
  }
}
