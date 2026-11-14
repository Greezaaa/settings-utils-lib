import { describe, expect, it } from 'vitest';
import { HOUR_MS, minutesUntilNextSend, remainingSends, sendsInLastHour } from './suggestion-limit';

const NOW = 10 * HOUR_MS;

describe('suggestion limit', () => {
  it('keeps only valid sends from the last hour', () => {
    expect(sendsInLastHour([NOW - HOUR_MS - 1, NOW - 10, 'x', NOW + 5, NOW - 20], NOW)).toEqual([NOW - 20, NOW - 10]);
    expect(sendsInLastHour(undefined, NOW)).toEqual([]);
  });

  it('counts what is left of the three an hour', () => {
    expect(remainingSends([])).toBe(3);
    expect(remainingSends([NOW - 10, NOW - 5])).toBe(1);
    expect(remainingSends([NOW - 3, NOW - 2, NOW - 1])).toBe(0);
  });

  it('says in how many minutes the next suggestion can go, once all three are used', () => {
    expect(minutesUntilNextSend([NOW - 10], NOW)).toBe(0);
    expect(minutesUntilNextSend([NOW - 40 * 60_000, NOW - 5, NOW - 1], NOW)).toBe(20);
    expect(minutesUntilNextSend([NOW - HOUR_MS + 1000, NOW - 5, NOW - 1], NOW)).toBe(1);
  });
});
