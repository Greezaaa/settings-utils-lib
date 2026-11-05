import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { SuFontSizeController, SuFontSizeLimits } from '@su-labs/core/font-size';
import { FontSizeConfig } from './font-size-config.interface';

/**
 * Angular service for managing the font size.
 *
 * Thin wrapper around the framework-agnostic `SuFontSizeController` from
 * `@su-labs/core/font-size` that exposes the size and limits as Angular signals.
 */
@Injectable({ providedIn: 'root' })
export class FontSizeService implements OnDestroy {
  /** Framework-agnostic font size logic */
  private readonly controller = new SuFontSizeController();

  private readonly initialLimits: SuFontSizeLimits = this.controller.limits.get();

  /** Default font size in pixels. Change it with {@link configure}. */
  defaultSize = signal(this.initialLimits.defaultSize);

  /** Minimum font size in pixels. Change it with {@link configure}. */
  minSize = signal(this.initialLimits.minSize);

  /** Maximum font size in pixels. Change it with {@link configure}. */
  maxSize = signal(this.initialLimits.maxSize);

  /** Default step in pixels for {@link increase} / {@link decrease}. Change it with {@link configure}. */
  step = signal(this.initialLimits.step);

  /** Current font size in pixels */
  fontSize = signal<number>(this.controller.fontSize.get());

  /** True if the current size equals the default size */
  isDefault = computed(() => this.fontSize() === this.defaultSize());

  /** True if the current size equals the maximum size */
  isMax = computed(() => this.fontSize() === this.maxSize());

  /** True if the current size equals the minimum size */
  isMin = computed(() => this.fontSize() === this.minSize());

  /** Stop syncing the controller's stores into the signals */
  private readonly unsubscribers = [
    this.controller.fontSize.subscribe((size) => this.fontSize.set(size)),
    this.controller.limits.subscribe((limits) => {
      this.defaultSize.set(limits.defaultSize);
      this.minSize.set(limits.minSize);
      this.maxSize.set(limits.maxSize);
      this.step.set(limits.step);
    }),
  ];

  /**
   * Update the configuration. Omitted values keep their current setting.
   * @param cfg Partial configuration (limits, step, storage key, CSS variable name).
   */
  configure(cfg: Partial<FontSizeConfig> = {}): void {
    this.controller.configure(cfg);
  }

  /**
   * Load the saved size (or the default), clamp it and apply it to the document.
   * Call once at application startup, after {@link configure}.
   */
  init(): void {
    this.controller.init();
  }

  /**
   * Set, apply and persist a font size, clamped to the allowed range.
   * @param size Desired font size in pixels.
   */
  setFontSize(size: number): void {
    this.controller.setFontSize(size);
  }

  /**
   * Increase the font size.
   * @param step Pixels to add. Defaults to {@link step}.
   */
  increase(step?: number): void {
    this.setFontSize(this.fontSize() + (step ?? this.step()));
  }

  /**
   * Decrease the font size.
   * @param step Pixels to remove. Defaults to {@link step}.
   */
  decrease(step?: number): void {
    this.setFontSize(this.fontSize() - (step ?? this.step()));
  }

  /** Return to the default size and remove the saved value from localStorage */
  reset(): void {
    this.controller.reset();
  }

  /** Angular lifecycle hook for service destruction */
  ngOnDestroy(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
  }
}
