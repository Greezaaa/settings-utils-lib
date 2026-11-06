import { SuStorage } from '@su-labs/core';

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
  /** Key the size is saved under */
  storageKey?: string;
  /**
   * Where the size is saved (default: `localStorage`).
   * Pass `createSuCookieStorage({ domain })` to share it with every site on that domain.
   */
  storage?: SuStorage;
  /** CSS custom property set on `<html>` */
  cssVarName?: string;
}
