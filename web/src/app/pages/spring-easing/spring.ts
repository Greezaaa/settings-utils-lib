export interface Spring {
  readonly stiffness: number;
  readonly damping: number;
  readonly mass: number;
}

export type SpringKey = keyof Spring;

export interface SpringPreset {
  readonly key: string;
  readonly name: string;
  readonly spring: Spring;
}

export interface SpringMotion {
  readonly duration: number;
  readonly samples: readonly number[];
}

export const SPRING_FIELDS: readonly {
  readonly key: SpringKey;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}[] = [
  { key: 'stiffness', label: 'Stiffness', min: 10, max: 1000, step: 5 },
  { key: 'damping', label: 'Damping', min: 1, max: 100, step: 1 },
  { key: 'mass', label: 'Mass', min: 0.1, max: 10, step: 0.1 },
];

export const SPRING_PRESETS: readonly SpringPreset[] = [
  { key: 'bouncy', name: 'Bouncy', spring: { stiffness: 300, damping: 10, mass: 1 } },
  { key: 'gentle', name: 'Gentle', spring: { stiffness: 100, damping: 15, mass: 1 } },
  { key: 'snappy', name: 'Snappy', spring: { stiffness: 400, damping: 30, mass: 1 } },
  { key: 'wobbly', name: 'Wobbly', spring: { stiffness: 180, damping: 6, mass: 1 } },
  { key: 'slow', name: 'Slow', spring: { stiffness: 60, damping: 14, mass: 1 } },
  { key: 'heavy', name: 'Heavy', spring: { stiffness: 200, damping: 25, mass: 3 } },
];

export const DEFAULT_SPRING: Spring = SPRING_PRESETS[0].spring;

const STEP_SECONDS = 0.001;
const MAX_SECONDS = 10;
const REST = 0.0005;
const FRAME_MS = 1000 / 60;
const MIN_POINTS = 20;
const MAX_POINTS = 120;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
const round = (value: number, digits: number): number => Number(value.toFixed(digits));

export const clampSpring = (key: SpringKey, value: number): number => {
  const field = SPRING_FIELDS.find((item) => item.key === key);
  return field ? round(clamp(value, field.min, field.max), 1) : value;
};

export const simulate = ({ stiffness, damping, mass }: Spring): SpringMotion => {
  const samples = [0];
  let position = 0;
  let velocity = 0;
  for (let time = STEP_SECONDS; time <= MAX_SECONDS; time += STEP_SECONDS) {
    const acceleration = (-stiffness * (position - 1) - damping * velocity) / mass;
    velocity += acceleration * STEP_SECONDS;
    position += velocity * STEP_SECONDS;
    samples.push(position);
    if (Math.abs(position - 1) < REST && Math.abs(velocity) < REST * 10) {
      break;
    }
  }
  samples[samples.length - 1] = 1;
  return { duration: Math.round((samples.length - 1) * STEP_SECONDS * 1000), samples };
};

export const springEaseAt = (motion: SpringMotion, progress: number): number => {
  const position = clamp(progress, 0, 1) * (motion.samples.length - 1);
  const index = Math.floor(position);
  const next = motion.samples[Math.min(index + 1, motion.samples.length - 1)];
  return motion.samples[index] + (next - motion.samples[index]) * (position - index);
};

export const formatLinear = (motion: SpringMotion): string => {
  const count = clamp(Math.round(motion.duration / FRAME_MS), MIN_POINTS, MAX_POINTS);
  const points = Array.from({ length: count + 1 }, (_, index) => round(springEaseAt(motion, index / count), 3));
  return `linear(${points.join(', ')})`;
};

export const sameSpring = (a: Spring, b: Spring): boolean =>
  a.stiffness === b.stiffness && a.damping === b.damping && a.mass === b.mass;

export const serializeSpring = (spring: Spring): string => [spring.stiffness, spring.damping, spring.mass].join(',');

export const parseSpring = (text: string | null): Spring | undefined => {
  const values = (text ?? '').split(',').map(Number);
  if (values.length !== 3 || values.some((value) => !Number.isFinite(value))) {
    return undefined;
  }
  return {
    stiffness: clampSpring('stiffness', values[0]),
    damping: clampSpring('damping', values[1]),
    mass: clampSpring('mass', values[2]),
  };
};

export const springPath = (motion: SpringMotion, width: number, height: number): string => {
  const peak = Math.max(1.2, ...motion.samples);
  const low = Math.min(-0.1, ...motion.samples);
  const stride = Math.max(1, Math.floor(motion.samples.length / 200));
  const points = motion.samples
    .filter((_, index) => index % stride === 0 || index === motion.samples.length - 1)
    .map((value, index, list) => {
      const x = (index / (list.length - 1)) * width;
      const y = ((peak - value) / (peak - low)) * height;
      return `${round(x, 2)} ${round(y, 2)}`;
    });
  return `M${points.join(' L')}`;
};

export const restLine = (motion: SpringMotion, height: number): number => {
  const peak = Math.max(1.2, ...motion.samples);
  const low = Math.min(-0.1, ...motion.samples);
  return round(((peak - 1) / (peak - low)) * height, 2);
};
