export type BezierCurve = readonly [x1: number, y1: number, x2: number, y2: number];

export type BezierHandle = 0 | 1;

export interface BezierPreset {
  readonly key: string;
  readonly name: string;
  readonly curve: BezierCurve;
  readonly keyword?: boolean;
}

export const BEZIER_Y_MIN = -0.6;
export const BEZIER_Y_MAX = 1.6;

export const BEZIER_PRESETS: readonly BezierPreset[] = [
  { key: 'ease', name: 'ease', curve: [0.25, 0.1, 0.25, 1], keyword: true },
  { key: 'linear', name: 'linear', curve: [0, 0, 1, 1], keyword: true },
  { key: 'ease-in', name: 'ease-in', curve: [0.42, 0, 1, 1], keyword: true },
  { key: 'ease-out', name: 'ease-out', curve: [0, 0, 0.58, 1], keyword: true },
  { key: 'ease-in-out', name: 'ease-in-out', curve: [0.42, 0, 0.58, 1], keyword: true },
  { key: 'ease-out-quart', name: 'ease-out-quart', curve: [0.25, 1, 0.5, 1] },
  { key: 'ease-out-expo', name: 'ease-out-expo', curve: [0.16, 1, 0.3, 1] },
  { key: 'ease-in-quart', name: 'ease-in-quart', curve: [0.5, 0, 0.75, 0] },
  { key: 'ease-out-back', name: 'ease-out-back', curve: [0.34, 1.56, 0.64, 1] },
  { key: 'ease-in-out-back', name: 'ease-in-out-back', curve: [0.68, -0.6, 0.32, 1.6] },
  { key: 'snappy', name: 'snappy', curve: [0.2, 0, 0, 1] },
];

export const DEFAULT_CURVE: BezierCurve = BEZIER_PRESETS[0].curve;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const round = (value: number): number => Math.round(value * 1000) / 1000;

export const clampX = (value: number): number => round(clamp(value, 0, 1));

export const clampY = (value: number): number => round(clamp(value, BEZIER_Y_MIN, BEZIER_Y_MAX));

export const clampCoordinate = (index: number, value: number): number =>
  index % 2 === 0 ? clampX(value) : clampY(value);

export const withCoordinate = (curve: BezierCurve, index: number, value: number): BezierCurve => {
  const next: [number, number, number, number] = [...curve];
  next[index] = clampCoordinate(index, value);
  return next;
};

export const withHandle = (curve: BezierCurve, handle: BezierHandle, x: number, y: number): BezierCurve =>
  withCoordinate(withCoordinate(curve, handle * 2, x), handle * 2 + 1, y);

export const handlePoint = (curve: BezierCurve, handle: BezierHandle): { readonly x: number; readonly y: number } => ({
  x: curve[handle * 2],
  y: curve[handle * 2 + 1],
});

export const sameCurve = (a: BezierCurve, b: BezierCurve): boolean => a.every((value, index) => value === b[index]);

export const findPreset = (curve: BezierCurve): BezierPreset | undefined =>
  BEZIER_PRESETS.find((preset) => sameCurve(preset.curve, curve));

export const formatNumber = (value: number): string => String(round(value));

export const formatCurve = (curve: BezierCurve): string => `cubic-bezier(${curve.map(formatNumber).join(', ')})`;

export const serializeCurve = (curve: BezierCurve): string => curve.map(formatNumber).join(',');

export const parseCurve = (text: string | null): BezierCurve | undefined => {
  const parts = (text ?? '').split(',').map((part) => part.trim());
  const values = parts.map(Number);
  if (values.length !== 4 || parts.some((part) => part === '') || values.some((value) => !Number.isFinite(value))) {
    return undefined;
  }
  const [x1, y1, x2, y2] = values;
  return [clampX(x1), clampY(y1), clampX(x2), clampY(y2)];
};

const axis = (t: number, p1: number, p2: number): number => {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * p1 + 3 * inverse * t * t * p2 + t * t * t;
};

const axisSlope = (t: number, p1: number, p2: number): number => {
  const inverse = 1 - t;
  return 3 * inverse * inverse * p1 + 6 * inverse * t * (p2 - p1) + 3 * t * t * (1 - p2);
};

const solveT = (x: number, x1: number, x2: number): number => {
  let t = x;
  for (let step = 0; step < 8; step++) {
    const error = axis(t, x1, x2) - x;
    const slope = axisSlope(t, x1, x2);
    if (Math.abs(error) < 1e-6) {
      return t;
    }
    if (Math.abs(slope) < 1e-6) {
      break;
    }
    t -= error / slope;
  }
  let low = 0;
  let high = 1;
  t = x;
  while (high - low > 1e-6) {
    if (axis(t, x1, x2) < x) {
      low = t;
    } else {
      high = t;
    }
    t = (low + high) / 2;
  }
  return t;
};

export const easeAt = (curve: BezierCurve, progress: number): number => {
  const [x1, y1, x2, y2] = curve;
  if (progress <= 0 || progress >= 1) {
    return clamp(progress, 0, 1);
  }
  return axis(solveT(progress, x1, x2), y1, y2);
};

export const curvePath = (curve: BezierCurve, toPoint: (x: number, y: number) => string): string => {
  const [x1, y1, x2, y2] = curve;
  return `M${toPoint(0, 0)} C${toPoint(x1, y1)} ${toPoint(x2, y2)} ${toPoint(1, 1)}`;
};
