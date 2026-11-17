import { hexToRgb, parseHex, rgbToHex } from '../../shared/color';

export type GradientType = 'linear' | 'radial' | 'conic';
export type GradientSpace = 'srgb' | 'oklch';

export interface GradientStop {
  readonly id: number;
  readonly color: string;
  readonly position: number;
}

export interface Gradient {
  readonly type: GradientType;
  readonly angle: number;
  readonly space: GradientSpace;
  readonly stops: readonly GradientStop[];
}

export interface GradientPreset {
  readonly key: string;
  readonly name: string;
  readonly gradient: Gradient;
}

const TYPES: readonly GradientType[] = ['linear', 'radial', 'conic'];
const SPACES: readonly GradientSpace[] = ['srgb', 'oklch'];

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const clampPosition = (value: number): number => Math.round(clamp(value, 0, 100));

export const clampAngle = (value: number): number => Math.round(((value % 360) + 360) % 360);

const stops = (...entries: readonly (readonly [string, number])[]): readonly GradientStop[] =>
  entries.map(([color, position], id) => ({ id, color, position }));

export const GRADIENT_PRESETS: readonly GradientPreset[] = [
  {
    key: 'sunrise',
    name: 'Sunrise',
    gradient: {
      type: 'linear',
      angle: 135,
      space: 'oklch',
      stops: stops(['#ff9a8b', 0], ['#ff6a88', 55], ['#ff99ac', 100]),
    },
  },
  {
    key: 'ocean',
    name: 'Ocean',
    gradient: { type: 'linear', angle: 160, space: 'oklch', stops: stops(['#2af598', 0], ['#009efd', 100]) },
  },
  {
    key: 'blue-yellow',
    name: 'Blue to yellow',
    gradient: { type: 'linear', angle: 90, space: 'oklch', stops: stops(['#0000ff', 0], ['#ffff00', 100]) },
  },
  {
    key: 'night',
    name: 'Night',
    gradient: {
      type: 'linear',
      angle: 180,
      space: 'oklch',
      stops: stops(['#0f2027', 0], ['#203a43', 50], ['#2c5364', 100]),
    },
  },
  {
    key: 'spotlight',
    name: 'Spotlight',
    gradient: { type: 'radial', angle: 0, space: 'oklch', stops: stops(['#fdfcfb', 0], ['#e2d1c3', 100]) },
  },
  {
    key: 'aurora',
    name: 'Aurora',
    gradient: {
      type: 'conic',
      angle: 0,
      space: 'oklch',
      stops: stops(['#00c6fb', 0], ['#005bea', 33], ['#a855f7', 66], ['#00c6fb', 100]),
    },
  },
  {
    key: 'candy',
    name: 'Candy',
    gradient: { type: 'linear', angle: 45, space: 'srgb', stops: stops(['#f093fb', 0], ['#f5576c', 100]) },
  },
  {
    key: 'mint',
    name: 'Mint',
    gradient: { type: 'linear', angle: 90, space: 'oklch', stops: stops(['#d4fc79', 0], ['#96e6a1', 100]) },
  },
];

export const DEFAULT_GRADIENT: Gradient = GRADIENT_PRESETS[0].gradient;

export const sortedStops = (gradient: Gradient): readonly GradientStop[] =>
  [...gradient.stops].sort((a, b) => a.position - b.position);

const stopList = (gradient: Gradient): string =>
  sortedStops(gradient)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ');

const interpolation = (space: GradientSpace): string => (space === 'oklch' ? ' in oklch' : '');

export const formatGradient = (gradient: Gradient): string => {
  const space = interpolation(gradient.space);
  const head =
    gradient.type === 'linear'
      ? `${gradient.angle}deg${space}`
      : gradient.type === 'conic'
        ? `from ${gradient.angle}deg${space}`
        : `circle${space}`;
  return `${gradient.type}-gradient(${head}, ${stopList(gradient)})`;
};

export const formatStripe = (gradient: Gradient): string =>
  `linear-gradient(90deg${interpolation(gradient.space)}, ${stopList(gradient)})`;

export const sameGradient = (a: Gradient, b: Gradient): boolean => serializeGradient(a) === serializeGradient(b);

export const serializeGradient = (gradient: Gradient): string =>
  [
    gradient.type,
    gradient.angle,
    gradient.space,
    ...sortedStops(gradient).map((stop) => `${stop.color.slice(1)}-${stop.position}`),
  ].join(',');

export const parseGradient = (text: string | null): Gradient | undefined => {
  const [type, angle, space, ...entries] = (text ?? '').split(',');
  const parsedType = TYPES.find((item) => item === type);
  const parsedSpace = SPACES.find((item) => item === space);
  const parsedStops = entries.map((entry, id) => {
    const [hex, position] = entry.split('-');
    const color = parseHex(hex);
    return color && Number.isFinite(Number(position))
      ? { id, color, position: clampPosition(Number(position)) }
      : undefined;
  });
  if (!parsedType || !parsedSpace || !Number.isFinite(Number(angle)) || parsedStops.length < 2) {
    return undefined;
  }
  const valid = parsedStops.filter((stop): stop is GradientStop => stop !== undefined);
  return valid.length === parsedStops.length
    ? { type: parsedType, angle: clampAngle(Number(angle)), space: parsedSpace, stops: valid }
    : undefined;
};

export const colorAt = (gradient: Gradient, position: number): string => {
  const ordered = sortedStops(gradient);
  const after = ordered.find((stop) => stop.position >= position) ?? ordered[ordered.length - 1];
  const before = [...ordered].reverse().find((stop) => stop.position <= position) ?? ordered[0];
  const from = hexToRgb(before.color);
  const to = hexToRgb(after.color);
  if (!from || !to || after.position === before.position) {
    return before.color;
  }
  const amount = (position - before.position) / (after.position - before.position);
  const mix = (a: number, b: number): number => a + (b - a) * amount;
  return rgbToHex({ r: mix(from.r, to.r), g: mix(from.g, to.g), b: mix(from.b, to.b) });
};

export const describeStop = (stop: GradientStop): string => `${stop.color} at ${stop.position}%`;

export const widestGapMiddle = (gradient: Gradient): number => {
  const positions = sortedStops(gradient).map((stop) => stop.position);
  const edges = [0, ...positions, 100];
  const gaps = edges.slice(1).map((end, index) => ({ start: edges[index], size: end - edges[index] }));
  const widest = gaps.reduce((best, gap) => (gap.size > best.size ? gap : best));
  return clampPosition(widest.start + widest.size / 2);
};

export const renderable = (gradient: Gradient, format: (gradient: Gradient) => string): string => {
  const value = format(gradient);
  const supported = typeof CSS === 'undefined' || CSS.supports('background-image', value);
  return supported ? value : format({ ...gradient, space: 'srgb' });
};
