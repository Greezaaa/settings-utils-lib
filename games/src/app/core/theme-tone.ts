export type Tone = 'light' | 'dark';
export const TONES: readonly Tone[] = ['light', 'dark'];

const NAMED: Readonly<Record<string, string>> = { black: '#000000', white: '#ffffff' };

export function toneOf(colour: string | undefined): Tone {
  const value = NAMED[colour?.trim().toLowerCase() ?? ''] ?? colour?.trim() ?? '';
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!match) {
    return 'light';
  }
  const digits = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
  const [red, green, blue] = [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16));
  return (0.299 * red + 0.587 * green + 0.114 * blue) / 255 >= 0.5 ? 'light' : 'dark';
}

export function byTone<T>(items: readonly T[], backgroundOf: (item: T) => string | undefined): Readonly<Record<Tone, T[]>> {
  return {
    light: items.filter((item) => toneOf(backgroundOf(item)) === 'light'),
    dark: items.filter((item) => toneOf(backgroundOf(item)) === 'dark'),
  };
}
