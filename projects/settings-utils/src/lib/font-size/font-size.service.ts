import { Injectable, signal, computed } from '@angular/core';
import { FontSizeConfig } from './font-size-config.interface';

@Injectable({ providedIn: 'root' })
export class FontSizeService {
  /**
   * Default font size in pixels.
   * Can be overridden via {@link configure}.
   */
  defaultSize = signal(14);

  /**
   * Minimum allowed font size in pixels.
   * Can be overridden via {@link configure}.
   */
  minSize = signal(10);

  /**
   * Maximum allowed font size in pixels.
   * Can be overridden via {@link configure}.
   */
  maxSize = signal(22);

  /**
   * Default step value (in pixels) for increase/decrease operations.
   * Can be overridden via {@link configure} or per call in {@link increase} / {@link decrease}.
   */
  step = signal(2);

  /**
   * Key used for persisting the font size in localStorage.
   * Defaults to `"app:font-size"`.
   */
  private storageKey = 'su:font-size';

  /**
   * CSS custom property name where the font size is applied.
   * Defaults to `"--base-font-size"`.
   */
  private cssVarName = '--base-font-size';

  /**
   * Current font size state (reactive).
   */
  fontSize = signal<number>(this.readFromStorage());

  /**
   * True if current font size equals the default size.
   */
  isDefault = computed(() => this.fontSize() === this.defaultSize());

  /**
   * True if current font size equals the maximum size.
   */
  isMax = computed(() => this.fontSize() === this.maxSize());

  /**
   * True if current font size equals the minimum size.
   */
  isMin = computed(() => this.fontSize() === this.minSize());

  /**
   * Updates the configuration for font size handling.
   * Any omitted values will fall back to their defaults.
   *
   * @param cfg Partial configuration object (min, max, default, step, storage key, CSS variable name).
   */
  configure(cfg: Partial<FontSizeConfig> = {}): void {
    if (cfg.minSize !== undefined) this.minSize.set(cfg.minSize);
    if (cfg.maxSize !== undefined) this.maxSize.set(cfg.maxSize);
    if (cfg.defaultSize !== undefined) this.defaultSize.set(cfg.defaultSize);
    if (cfg.step !== undefined) this.step.set(cfg.step);
    if (cfg.storageKey) this.storageKey = cfg.storageKey;
    if (cfg.cssVarName) this.cssVarName = cfg.cssVarName;

    // Ensure logical invariants
    if (this.minSize() > this.maxSize()) this.maxSize.set(this.minSize());
    if (this.defaultSize() < this.minSize())
      this.defaultSize.set(this.minSize());
    if (this.defaultSize() > this.maxSize())
      this.defaultSize.set(this.maxSize());
    if (this.step() <= 0 || !Number.isFinite(this.step())) this.step.set(1);

    // Clamp current size after configuration changes
    this.fontSize.update((s) => this.clamp(s));
  }

  /**
   * Initializes the font size service.
   * Loads the persisted value (if available), clamps it,
   * applies it to the DOM, and updates internal state.
   * Should typically be called once at application startup.
   */
  init(): void {
    const size = this.readFromStorage();
    this.fontSize.set(this.clamp(size));
    this.applyCssVar(this.fontSize());
  }

  /**
   * Sets the font size to a specific value (clamped within min/max).
   *
   * @param size Desired font size in pixels.
   */
  setFontSize(size: number): void {
    const clamped = this.clamp(size);
    this.fontSize.set(clamped);
    this.applyCssVar(clamped);
    this.writeToStorage(clamped);
  }

  /**
   * Increases the font size.
   *
   * @param step Optional custom step (pixels). Falls back to configured {@link step} if omitted.
   */
  increase(step?: number): void {
    this.setFontSize(this.fontSize() + (step ?? this.step()));
  }

  /**
   * Decreases the font size.
   *
   * @param step Optional custom step (pixels). Falls back to configured {@link step} if omitted.
   */
  decrease(step?: number): void {
    this.setFontSize(this.fontSize() - (step ?? this.step()));
  }

  /**
   * Resets the font size to the configured {@link defaultSize}.
   * Also removes the persisted value from localStorage.
   */
  reset(): void {
    const d = this.defaultSize();
    this.fontSize.set(d);
    this.applyCssVar(d);
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Clamps a given value between the configured {@link minSize} and {@link maxSize}.
   *
   * @param size Value to clamp.
   * @returns Clamped value within the allowed range.
   */
  private clamp(size: number): number {
    return Math.min(Math.max(size, this.minSize()), this.maxSize());
  }

  /**
   * Reads the font size from localStorage.
   * Falls back to {@link defaultSize} if no value is stored or value is invalid.
   *
   * @returns Stored font size or default.
   */
  private readFromStorage(): number {
    const stored = localStorage.getItem(this.storageKey);
    const parsed = stored ? Number(stored) : this.defaultSize();
    return Number.isFinite(parsed) ? parsed : this.defaultSize();
  }

  /**
   * Persists the current font size in localStorage.
   *
   * @param size Font size value to persist.
   */
  private writeToStorage(size: number): void {
    localStorage.setItem(this.storageKey, String(size));
  }

  /**
   * Applies the current font size to the DOM
   * using the configured CSS custom property name.
   *
   * @param size Font size value in pixels.
   */
  private applyCssVar(size: number): void {
    document.documentElement.style.setProperty(this.cssVarName, `${size}px`);
  }
}
