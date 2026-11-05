import { SuFontSizeConfig, SuFontSizeLimits } from '@su-labs/core/font-size';

/** Font size configuration: limits and step in pixels, plus optional storage key and CSS variable name */
export type FontSizeConfig = SuFontSizeLimits & Pick<SuFontSizeConfig, 'storageKey' | 'cssVarName'>;
