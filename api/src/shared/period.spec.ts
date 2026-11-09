import { periodStart } from './period.js';

describe('periodStart', () => {
  // A Sunday
  const now = new Date('2026-11-08T15:00:00Z');

  it('starts each period on its calendar day, and all time has no start', () => {
    expect(periodStart('all', now)).toBeNull();
    expect(periodStart('day', now)).toBe('2026-11-08');
    expect(periodStart('week', now)).toBe('2026-11-02');
    expect(periodStart('month', now)).toBe('2026-11-01');
    expect(periodStart('year', now)).toBe('2026-01-01');
  });

  it('starts the week on the same Monday', () => {
    expect(periodStart('week', new Date('2026-11-02T00:00:00Z'))).toBe(
      '2026-11-02',
    );
  });
});
