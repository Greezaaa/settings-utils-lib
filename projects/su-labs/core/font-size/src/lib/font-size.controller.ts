import { createSuStore, isBrowser, SuReadableStore } from '@su-labs/core';
import { SuFontSizeConfig, SuFontSizeLimits } from './font-size.types';

/** Limits used until `configure()` changes them */
const DEFAULT_LIMITS: SuFontSizeLimits = {
  defaultSize: 14,
  minSize: 10,
  maxSize: 22,
  step: 2,
};

/**
 * Framework-agnostic font size manager.
 *
 * Keeps the font size within configured limits, applies it to `<html>` as a CSS
 * custom property (in pixels), persists it in localStorage, and exposes the size
 * and limits as reactive stores.
 * Safe to import in Node: browser-only work is skipped when there is no DOM.
 */
export class SuFontSizeController {
  /** localStorage key for the saved size */
  private storageKey = 'su:font-size';

  /** CSS custom property set on `<html>` */
  private cssVarName = '--base-font-size';

  private readonly limitsStore = createSuStore<SuFontSizeLimits>(DEFAULT_LIMITS);

  private readonly fontSizeStore = createSuStore<number>(this.readFromStorage());

  /** Reactive, read-only access to the current limits and step */
  readonly limits: SuReadableStore<SuFontSizeLimits> = this.limitsStore.asReadonly();

  /** Reactive, read-only access to the current font size in pixels */
  readonly fontSize: SuReadableStore<number> = this.fontSizeStore.asReadonly();

  /**
   * Update the configuration. Omitted values keep their current setting.
   * Invalid combinations are corrected (max below min, default outside the range,
   * non-positive step) and the current size is clamped to the new range.
   * @param config Partial configuration.
   */
  configure(config: SuFontSizeConfig = {}): void {
    const current = this.limitsStore.get();
    const minSize = config.minSize ?? current.minSize;
    const maxSize = Math.max(config.maxSize ?? current.maxSize, minSize);
    const defaultSize = clamp(config.defaultSize ?? current.defaultSize, minSize, maxSize);
    const step = config.step ?? current.step;

    this.storageKey = config.storageKey || this.storageKey;
    this.cssVarName = config.cssVarName || this.cssVarName;
    this.limitsStore.set({
      defaultSize,
      minSize,
      maxSize,
      step: step > 0 && Number.isFinite(step) ? step : 1,
    });
    this.fontSizeStore.set(this.clamp(this.fontSizeStore.get()));
  }

  /**
   * Load the saved size (or the default), clamp it and apply it to the document.
   * Call once at startup, after `configure()`.
   */
  init(): void {
    const size = this.clamp(this.readFromStorage());
    this.fontSizeStore.set(size);
    this.applyCssVar(size);
  }

  /**
   * Set, apply and persist a font size, clamped to the allowed range.
   * @param size Desired font size in pixels.
   */
  setFontSize(size: number): void {
    const clamped = this.clamp(size);
    this.fontSizeStore.set(clamped);
    this.applyCssVar(clamped);
    if (isBrowser()) {
      localStorage.setItem(this.storageKey, String(clamped));
    }
  }

  /**
   * Increase the font size.
   * @param step Pixels to add. Defaults to the configured step.
   */
  increase(step?: number): void {
    this.setFontSize(this.fontSizeStore.get() + (step ?? this.limitsStore.get().step));
  }

  /**
   * Decrease the font size.
   * @param step Pixels to remove. Defaults to the configured step.
   */
  decrease(step?: number): void {
    this.setFontSize(this.fontSizeStore.get() - (step ?? this.limitsStore.get().step));
  }

  /** Return to the default size and forget the saved one */
  reset(): void {
    const { defaultSize } = this.limitsStore.get();
    this.fontSizeStore.set(defaultSize);
    this.applyCssVar(defaultSize);
    if (isBrowser()) {
      localStorage.removeItem(this.storageKey);
    }
  }

  /** Clamp a size to the configured range */
  private clamp(size: number): number {
    const { minSize, maxSize } = this.limitsStore.get();
    return clamp(size, minSize, maxSize);
  }

  /** Saved size, or the default when nothing valid is saved or there is no browser */
  private readFromStorage(): number {
    const { defaultSize } = this.limitsStore.get();
    const stored = isBrowser() ? localStorage.getItem(this.storageKey) : null;
    const parsed = stored ? Number(stored) : defaultSize;
    return Number.isFinite(parsed) ? parsed : defaultSize;
  }

  /** Set the CSS custom property on `<html>` */
  private applyCssVar(size: number): void {
    if (isBrowser()) {
      document.documentElement.style.setProperty(this.cssVarName, `${size}px`);
    }
  }
}

/** Limit `value` to the range `[min, max]` */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
