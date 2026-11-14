export const SUGGESTIONS_PER_HOUR = 3;
export const HOUR_MS = 60 * 60_000;

export function sendsInLastHour(stored: unknown, now: number): number[] {
  return Array.isArray(stored)
    ? stored.filter((time: unknown): time is number => typeof time === 'number' && time <= now && now - time < HOUR_MS).sort((first, second) => first - second)
    : [];
}

export const remainingSends = (times: readonly number[]): number => Math.max(0, SUGGESTIONS_PER_HOUR - times.length);

export function minutesUntilNextSend(times: readonly number[], now: number): number {
  if (remainingSends(times) > 0) {
    return 0;
  }
  const oldest = times[times.length - SUGGESTIONS_PER_HOUR];
  return Math.max(1, Math.ceil((oldest + HOUR_MS - now) / 60_000));
}
