export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Hsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export interface Oklch {
  readonly l: number;
  readonly c: number;
  readonly h: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const roundTo = (value: number, digits: number): number => Number(value.toFixed(digits));
const wrapHue = (hue: number): number => ((hue % 360) + 360) % 360;

const toLinear = (channel: number): number => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (value: number): number =>
  255 * (value <= 0.0031308 ? 12.92 * value : 1.055 * Math.sign(value) * Math.abs(value) ** (1 / 2.4) - 0.055);

const clampRgb = ({ r, g, b }: Rgb): Rgb => ({ r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) });

export const hexToRgb = (text: string): Rgb | undefined => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text.trim());
  if (!match) {
    return undefined;
  }
  const hex = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1].slice(0, 6);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

export const rgbToHex = (rgb: Rgb): string => {
  const { r, g, b } = clampRgb(rgb);
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
};

export const rgbToHsl = ({ r, g, b }: Rgb): Hsl => {
  const [red, green, blue] = [r / 255, g / 255, b / 255];
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  const hue =
    max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  return { h: wrapHue(hue * 60), s: saturation * 100, l: lightness * 100 };
};

export const hslToRgb = ({ h, s, l }: Hsl): Rgb => {
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  const amount = saturation * Math.min(lightness, 1 - lightness);
  const channel = (offset: number): number => {
    const k = (offset + wrapHue(h) / 30) % 12;
    return 255 * (lightness - amount * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return { r: channel(0), g: channel(8), b: channel(4) };
};

export const rgbToOklch = ({ r, g, b }: Rgb): Oklch => {
  const [red, green, blue] = [toLinear(r), toLinear(g), toLinear(b)];
  const long = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short;
  const a = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const bAxis = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;
  const chroma = Math.hypot(a, bAxis);
  return { l: lightness, c: chroma, h: chroma < 1e-4 ? 0 : wrapHue((Math.atan2(bAxis, a) * 180) / Math.PI) };
};

const oklchToLinear = ({ l, c, h }: Oklch): readonly [number, number, number] => {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);
  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ];
};

const inGamut = (color: Oklch): boolean => oklchToLinear(color).every((value) => value >= -1e-4 && value <= 1 + 1e-4);

export const oklchToRgb = (color: Oklch): Rgb => {
  let low = 0;
  let high = color.c;
  while (!inGamut({ ...color, c: high }) && high - low > 1e-4) {
    const chroma = (low + high) / 2;
    if (inGamut({ ...color, c: chroma })) {
      low = chroma;
    } else {
      high = chroma;
    }
  }
  const [r, g, b] = oklchToLinear({ ...color, c: inGamut({ ...color, c: high }) ? high : low });
  return clampRgb({ r: fromLinear(r), g: fromLinear(g), b: fromLinear(b) });
};

const NUMBER = String.raw`(-?[\d.]+)`;
const SEPARATOR = String.raw`[\s,]+`;
const RGB_PATTERN = new RegExp(String.raw`^rgba?\(\s*${NUMBER}${SEPARATOR}${NUMBER}${SEPARATOR}${NUMBER}`, 'i');
const HSL_PATTERN = new RegExp(
  String.raw`^hsla?\(\s*${NUMBER}(?:deg)?${SEPARATOR}${NUMBER}%?${SEPARATOR}${NUMBER}%?`,
  'i',
);
const OKLCH_PATTERN = new RegExp(String.raw`^oklch\(\s*${NUMBER}(%?)\s+${NUMBER}\s+${NUMBER}`, 'i');

export const parseColor = (text: string): Rgb | undefined => {
  const value = text.trim();
  const rgb = RGB_PATTERN.exec(value);
  if (rgb) {
    return clampRgb({ r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) });
  }
  const hsl = HSL_PATTERN.exec(value);
  if (hsl) {
    return hslToRgb({ h: Number(hsl[1]), s: Number(hsl[2]), l: Number(hsl[3]) });
  }
  const oklch = OKLCH_PATTERN.exec(value);
  if (oklch) {
    const lightness = Number(oklch[1]) / (oklch[2] === '%' ? 100 : 1);
    return oklchToRgb({ l: clamp(lightness, 0, 1), c: Math.max(0, Number(oklch[3])), h: Number(oklch[4]) });
  }
  return hexToRgb(value);
};

export const parseHex = (text: string | null | undefined): string | undefined => {
  const rgb = text ? hexToRgb(text) : undefined;
  return rgb ? rgbToHex(rgb) : undefined;
};

export const formatRgb = (rgb: Rgb, alpha = 1): string => {
  const { r, g, b } = clampRgb(rgb);
  const channels = [r, g, b].map(Math.round).join(' ');
  return alpha < 1 ? `rgb(${channels} / ${roundTo(alpha, 2)})` : `rgb(${channels})`;
};

export const formatHsl = (rgb: Rgb): string => {
  const { h, s, l } = rgbToHsl(rgb);
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
};

export const formatOklch = (rgb: Rgb): string => {
  const { l, c, h } = rgbToOklch(rgb);
  return `oklch(${roundTo(l * 100, 1)}% ${roundTo(c, 3)} ${roundTo(h, 1)})`;
};

export const relativeLuminance = ({ r, g, b }: Rgb): number =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

export const contrastRatio = (first: Rgb, second: Rgb): number => {
  const [light, dark] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};
