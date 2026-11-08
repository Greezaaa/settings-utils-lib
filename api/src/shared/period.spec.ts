import { periodStart } from './period.js';

describe('periodStart', () => {
  const now = new Date('2026-11-08T15:00:00Z');

  it('counts today in each period, and all time has no start', () => {
    expect(periodStart('all', now)).toBeNull();
    expect(periodStart('day', now)).toBe('2026-11-08');
    expect(periodStart('week', now)).toBe('2026-11-02');
    expect(periodStart('month', now)).toBe('2026-10-10');
    expect(periodStart('year', now)).toBe('2026-01-01');
  });
});
