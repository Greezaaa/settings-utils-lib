export interface FluidRange {
  readonly minSize: number;
  readonly maxSize: number;
  readonly minViewport: number;
  readonly maxViewport: number;
  readonly root: number;
}

export interface FluidScale {
  readonly minBase: number;
  readonly maxBase: number;
  readonly minRatio: number;
  readonly maxRatio: number;
}

export type FluidRangeKey = keyof FluidRange;
export type FluidScaleKey = 'minBase' | 'maxBase';

export interface NumberField<Key extends string> {
  readonly key: Key;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

export const RANGE_FIELDS: readonly NumberField<FluidRangeKey>[] = [
  { key: 'minSize', label: 'Smallest size (px)', min: 1, max: 400, step: 1 },
  { key: 'maxSize', label: 'Largest size (px)', min: 1, max: 400, step: 1 },
  { key: 'minViewport', label: 'From width (px)', min: 200, max: 3000, step: 10 },
  { key: 'maxViewport', label: 'To width (px)', min: 200, max: 3000, step: 10 },
  { key: 'root', label: 'Root font size (px)', min: 8, max: 32, step: 1 },
];

export const SCALE_FIELDS: readonly NumberField<FluidScaleKey>[] = [
  { key: 'minBase', label: 'Base size, narrow (px)', min: 8, max: 40, step: 1 },
  { key: 'maxBase', label: 'Base size, wide (px)', min: 8, max: 40, step: 1 },
];

export const SCALE_RATIOS: readonly { readonly value: number; readonly name: string }[] = [
  { value: 1.067, name: 'Minor second' },
  { value: 1.125, name: 'Major second' },
  { value: 1.2, name: 'Minor third' },
  { value: 1.25, name: 'Major third' },
  { value: 1.333, name: 'Perfect fourth' },
  { value: 1.414, name: 'Augmented fourth' },
  { value: 1.5, name: 'Perfect fifth' },
  { value: 1.618, name: 'Golden ratio' },
];

export const SCALE_STEPS = [5, 4, 3, 2, 1, 0, -1, -2];

export const DEFAULT_RANGE: FluidRange = { minSize: 18, maxSize: 24, minViewport: 360, maxViewport: 1280, root: 16 };
export const DEFAULT_SCALE: FluidScale = { minBase: 16, maxBase: 18, minRatio: 1.2, maxRatio: 1.25 };

const round = (value: number, digits = 4): number => Number(value.toFixed(digits));
const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const clampField = <Key extends string>(field: NumberField<Key>, value: number): number =>
  round(clamp(value, field.min, field.max), 2);

const slopeOf = (range: FluidRange): number =>
  range.maxViewport === range.minViewport
    ? 0
    : (range.maxSize - range.minSize) / (range.maxViewport - range.minViewport);

export const fluidClamp = (range: FluidRange): string => {
  const rem = (pixels: number): string => `${round(pixels / range.root)}rem`;
  const slope = slopeOf(range);
  const intercept = range.minSize - slope * range.minViewport;
  const preferred =
    intercept < 0 ? `${round(slope * 100)}vw - ${rem(-intercept)}` : `${rem(intercept)} + ${round(slope * 100)}vw`;
  const low = Math.min(range.minSize, range.maxSize);
  const high = Math.max(range.minSize, range.maxSize);
  return `clamp(${rem(low)}, ${preferred}, ${rem(high)})`;
};

export const sizeAt = (range: FluidRange, viewport: number): number => {
  const size = range.minSize + slopeOf(range) * (viewport - range.minViewport);
  return round(clamp(size, Math.min(range.minSize, range.maxSize), Math.max(range.minSize, range.maxSize)), 1);
};

export const scaleRange = (scale: FluidScale, range: FluidRange, step: number): FluidRange => ({
  ...range,
  minSize: round(scale.minBase * scale.minRatio ** step, 2),
  maxSize: round(scale.maxBase * scale.maxRatio ** step, 2),
});

export const stepName = (step: number): string => `--step-${step}`;

export const serializeNumbers = (values: readonly number[]): string => values.join(',');

export const parseNumbers = (text: string | null, count: number): readonly number[] | undefined => {
  const values = (text ?? '').split(',').map(Number);
  return values.length === count && values.every((value) => Number.isFinite(value) && value > 0) ? values : undefined;
};
