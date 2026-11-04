import { Injectable, OnDestroy, signal } from '@angular/core';
import { SuThemeConfig, SuThemeController, SuThemeName } from '@su-labs/core/theme';

/**
 * Angular service for managing application themes.
 *
 * Thin wrapper around the framework-agnostic `SuThemeController` from `@su-labs/core/theme`
 * that exposes the resolved theme as an Angular signal.
 */
@Injectable({
  providedIn: 'root',
})
export class SuThemeService implements OnDestroy {
  /** Framework-agnostic theme logic */
  private readonly controller = new SuThemeController();

  /** Current resolved theme signal, kept in sync with the controller */
  private readonly currentThemeSignal = signal<SuThemeName>(this.controller.getTheme());

  /** Read-only access to the resolved theme signal */
  readonly theme = this.currentThemeSignal.asReadonly();

  /** Stops syncing the controller's theme into the signal */
  private readonly unsubscribe = this.controller.theme.subscribe((theme) => this.currentThemeSignal.set(theme));

  /**
   * Initialize the service with optional configuration.
   * Should be called from an app initializer for default setup.
   * @param config Optional configuration object.
   */
  public init(config?: SuThemeConfig): void {
    this.controller.init(config);
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
    return this.controller.getUserPreference();
  }

  /**
   * Set a new theme.
   * @param theme The theme to set ('light', 'dark', 'contrast', 'custom', 'system').
   * @param persist Whether to store the preference in localStorage (default: true).
   */
  public setTheme(theme: SuThemeName, persist: boolean = true): void {
    this.controller.setTheme(theme, persist);
  }

  /** Angular lifecycle hook for service destruction */
  ngOnDestroy(): void {
    this.unsubscribe();
    this.controller.destroy();
  }
}
