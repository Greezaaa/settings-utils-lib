import { formatRgb, hexToRgb, parseHex } from '../../shared/color';

export interface ShadowLayer {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  readonly color: string;
  readonly opacity: number;
  readonly inset: boolean;
}

export type ShadowNumber = 'x' | 'y' | 'blur' | 'spread';

export interface ShadowPreset {
  readonly key: string;
  readonly name: string;
  readonly layers: readonly ShadowLayer[];
}

export const SHADOW_RANGES: readonly {
  readonly key: ShadowNumber;
  readonly label: string;
  readonly min: number;
  readonly max: number;
}[] = [
  { key: 'x', label: 'X offset', min: -50, max: 50 },
  { key: 'y', label: 'Y offset', min: -50, max: 50 },
  { key: 'blur', label: 'Blur', min: 0, max: 100 },
  { key: 'spread', label: 'Spread', min: -50, max: 50 },
];

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const clampShadowNumber = (key: ShadowNumber, value: number): number => {
  const range = SHADOW_RANGES.find((item) => item.key === key);
  return range ? Math.round(clamp(value, range.min, range.max)) : value;
};

export const clampOpacity = (value: number): number => Math.round(clamp(value, 0, 1) * 100) / 100;

type LayerValues = readonly [
  x: number,
  y: number,
  blur: number,
  spread: number,
  color: string,
  opacity: number,
  inset?: boolean,
];

const layers = (...entries: readonly LayerValues[]): readonly ShadowLayer[] =>
  entries.map(([x, y, blur, spread, color, opacity, inset = false], id) => ({
    id,
    x,
    y,
    blur,
    spread,
    color,
    opacity,
    inset,
  }));

export const SHADOW_PRESETS: readonly ShadowPreset[] = [
  { key: 'soft', name: 'Soft', layers: layers([0, 2, 8, 0, '#000000', 0.06], [0, 12, 32, -4, '#000000', 0.12]) },
  {
    key: 'layered',
    name: 'Layered',
    layers: layers(
      [0, 1, 1, 0, '#000000', 0.08],
      [0, 2, 2, 0, '#000000', 0.08],
      [0, 4, 4, 0, '#000000', 0.08],
      [0, 8, 8, 0, '#000000', 0.08],
      [0, 16, 16, 0, '#000000', 0.08],
    ),
  },
  { key: 'floating', name: 'Floating', layers: layers([0, 24, 48, -12, '#000000', 0.3]) },
  { key: 'sharp', name: 'Sharp', layers: layers([6, 6, 0, 0, '#111111', 1]) },
  { key: 'inset', name: 'Inset', layers: layers([0, 2, 6, 0, '#000000', 0.2, true]) },
  { key: 'glow', name: 'Glow', layers: layers([0, 0, 24, 4, '#6366f1', 0.55]) },
  { key: 'ring', name: 'Focus ring', layers: layers([0, 0, 0, 2, '#ffffff', 1], [0, 0, 0, 4, '#3b82f6', 1]) },
];

export const DEFAULT_LAYERS: readonly ShadowLayer[] = SHADOW_PRESETS[0].layers;

export const newLayer = (id: number): ShadowLayer => ({
  id,
  x: 0,
  y: 8,
  blur: 16,
  spread: 0,
  color: '#000000',
  opacity: 0.15,
  inset: false,
});

const formatLayer = (layer: ShadowLayer): string => {
  const color = formatRgb(hexToRgb(layer.color) ?? { r: 0, g: 0, b: 0 }, layer.opacity);
  const lengths = [layer.x, layer.y, layer.blur, layer.spread]
    .map((value) => (value === 0 ? '0' : `${value}px`))
    .join(' ');
  return `${layer.inset ? 'inset ' : ''}${lengths} ${color}`;
};

export const formatShadow = (shadow: readonly ShadowLayer[]): string => shadow.map(formatLayer).join(', ');

export const formatShadowCss = (shadow: readonly ShadowLayer[]): string =>
  shadow.length === 1
    ? `box-shadow: ${formatLayer(shadow[0])};`
    : `box-shadow:\n    ${shadow.map(formatLayer).join(',\n    ')};`;

export const serializeShadow = (shadow: readonly ShadowLayer[]): string =>
  shadow
    .map((layer) =>
      [layer.x, layer.y, layer.blur, layer.spread, layer.color.slice(1), layer.opacity, layer.inset ? 1 : 0].join('_'),
    )
    .join(',');

export const parseShadow = (text: string | null): readonly ShadowLayer[] | undefined => {
  if (!text) {
    return undefined;
  }
  const parsed = text.split(',').map((entry, id): ShadowLayer | undefined => {
    const [x, y, blur, spread, hex, opacity, inset] = entry.split('_');
    const color = parseHex(hex);
    const numbers = [x, y, blur, spread, opacity].map(Number);
    if (!color || numbers.some((value) => !Number.isFinite(value))) {
      return undefined;
    }
    return {
      id,
      x: clampShadowNumber('x', numbers[0]),
      y: clampShadowNumber('y', numbers[1]),
      blur: clampShadowNumber('blur', numbers[2]),
      spread: clampShadowNumber('spread', numbers[3]),
      color,
      opacity: clampOpacity(numbers[4]),
      inset: inset === '1',
    };
  });
  const valid = parsed.filter((layer): layer is ShadowLayer => layer !== undefined);
  return valid.length > 0 && valid.length === parsed.length ? valid : undefined;
};
