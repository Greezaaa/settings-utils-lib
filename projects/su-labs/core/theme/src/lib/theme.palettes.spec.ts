import { describe, expect, it } from 'vitest';
import { SU_THEME_PALETTES } from './theme.palettes';

/** WCAG contrast ratio of two `#rrggbb` colours */
function contrast(first: string, second: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map(start => {
      const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
      return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a
  );
  return (light + 0.05) / (dark + 0.05);
}

describe('SU_THEME_PALETTES', () => {
  it.each(Object.entries(SU_THEME_PALETTES))('%s keeps its text and button text readable', (_, { variables }) => {
    const { color = '', background = '', 'main-accent': accent = '', 'button-text': buttonText = '' } = variables;
    expect(contrast(color, background)).toBeGreaterThanOrEqual(7);
    expect(contrast(buttonText, accent)).toBeGreaterThanOrEqual(4.5);
  });
});
