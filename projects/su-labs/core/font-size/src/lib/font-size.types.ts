/** Size limits and step, in pixels */
export interface SuFontSizeLimits {
  /** Size used before the user picks one, and after `reset()` */
  defaultSize: number;
  /** Smallest allowed size */
  minSize: number;
  /** Largest allowed size */
  maxSize: number;
  /** Amount added or removed by `increase()` / `decrease()` */
  step: number;
}

/** Font size configuration. Omitted values keep their current setting. */
export interface SuFontSizeConfig extends Partial<SuFontSizeLimits> {
  /** localStorage key for the saved size */
  storageKey?: string;
  /** CSS custom property set on `<html>` */
  cssVarName?: string;
}
