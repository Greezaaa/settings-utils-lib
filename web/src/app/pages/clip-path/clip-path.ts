export interface ClipPoint {
  readonly id: number;
  readonly x: number;
  readonly y: number;
}

export interface ClipPreset {
  readonly key: string;
  readonly name: string;
  readonly points: readonly ClipPoint[];
}

export const MIN_POINTS = 3;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const clampPercent = (value: number): number => Math.round(clamp(value, 0, 100));

const points = (...entries: readonly (readonly [number, number])[]): readonly ClipPoint[] =>
  entries.map(([x, y], id) => ({ id, x, y }));

export const CLIP_PRESETS: readonly ClipPreset[] = [
  { key: 'triangle', name: 'Triangle', points: points([50, 0], [100, 100], [0, 100]) },
  { key: 'trapezoid', name: 'Trapezoid', points: points([20, 0], [80, 0], [100, 100], [0, 100]) },
  { key: 'parallelogram', name: 'Parallelogram', points: points([25, 0], [100, 0], [75, 100], [0, 100]) },
  { key: 'rhombus', name: 'Rhombus', points: points([50, 0], [100, 50], [50, 100], [0, 50]) },
  { key: 'pentagon', name: 'Pentagon', points: points([50, 0], [100, 38], [82, 100], [18, 100], [0, 38]) },
  { key: 'hexagon', name: 'Hexagon', points: points([25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]) },
  {
    key: 'star',
    name: 'Star',
    points: points([50, 0], [61, 35], [98, 35], [68, 57], [79, 91], [50, 70], [21, 91], [32, 57], [2, 35], [39, 35]),
  },
  { key: 'arrow', name: 'Arrow', points: points([0, 20], [60, 20], [60, 0], [100, 50], [60, 100], [60, 80], [0, 80]) },
  { key: 'chevron', name: 'Chevron', points: points([75, 0], [100, 50], [75, 100], [0, 100], [25, 50], [0, 0]) },
  {
    key: 'message',
    name: 'Message',
    points: points([0, 0], [100, 0], [100, 75], [75, 75], [75, 100], [50, 75], [0, 75]),
  },
];

export const DEFAULT_POINTS: readonly ClipPoint[] = CLIP_PRESETS[4].points;

export const formatPolygon = (shape: readonly ClipPoint[]): string =>
  `polygon(${shape.map((point) => `${point.x}% ${point.y}%`).join(', ')})`;

export const outlinePoints = (shape: readonly ClipPoint[]): string =>
  shape.map((point) => `${point.x},${point.y}`).join(' ');

export const serializeShape = (shape: readonly ClipPoint[]): string =>
  shape.map((point) => `${point.x}_${point.y}`).join(',');

export const sameShape = (a: readonly ClipPoint[], b: readonly ClipPoint[]): boolean =>
  serializeShape(a) === serializeShape(b);

export const parseShape = (text: string | null): readonly ClipPoint[] | undefined => {
  const parsed = (text ?? '').split(',').map((entry, id) => {
    const [x, y] = entry.split('_').map(Number);
    return Number.isFinite(x) && Number.isFinite(y) ? { id, x: clampPercent(x), y: clampPercent(y) } : undefined;
  });
  const valid = parsed.filter((point): point is ClipPoint => point !== undefined);
  return valid.length >= MIN_POINTS && valid.length === parsed.length ? valid : undefined;
};

const distanceToSegment = (point: { x: number; y: number }, start: ClipPoint, end: ClipPoint): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = dx * dx + dy * dy;
  const amount = length === 0 ? 0 : clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / length, 0, 1);
  return Math.hypot(point.x - (start.x + amount * dx), point.y - (start.y + amount * dy));
};

export const nearestEdge = (shape: readonly ClipPoint[], point: { x: number; y: number }): number =>
  shape
    .map((start, index) => ({ index, distance: distanceToSegment(point, start, shape[(index + 1) % shape.length]) }))
    .reduce((best, edge) => (edge.distance < best.distance ? edge : best)).index;
