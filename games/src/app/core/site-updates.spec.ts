import { describe, expect, it } from 'vitest';
import { changesIn, LATEST_PRIVACY_VERSION, LATEST_VERSION, SITE_UPDATES, SiteUpdate, updatesSince } from './site-updates';

const UPDATES: readonly SiteUpdate[] = [
  { version: 1, date: '2026-01-01', privacy: true, changes: { en: ['One'], es: ['Uno'], eu: ['Bat'] } },
  { version: 2, date: '2026-02-01', changes: { en: ['Two', 'Three'], es: ['Dos', 'Tres'], eu: ['Bi', 'Hiru'] } },
];

describe('site updates', () => {
  it('lists only the updates after the last one seen', () => {
    expect(updatesSince(0, UPDATES).map(({ version }) => version)).toEqual([1, 2]);
    expect(updatesSince(1, UPDATES).map(({ version }) => version)).toEqual([2]);
    expect(updatesSince(2, UPDATES)).toEqual([]);
  });

  it('gathers their changes in one language', () => {
    expect(changesIn(UPDATES, 'es')).toEqual(['Uno', 'Dos', 'Tres']);
  });

  it('keeps versions counting up, dates in order, and every change in every language', () => {
    SITE_UPDATES.forEach((update, index) => {
      expect(update.version).toBe(index + 1);
      expect(update.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(update.date >= (SITE_UPDATES[index - 1]?.date ?? '')).toBe(true);
      expect(update.changes.es).toHaveLength(update.changes.en.length);
      expect(update.changes.eu).toHaveLength(update.changes.en.length);
    });
    expect(LATEST_VERSION).toBe(SITE_UPDATES.length);
    expect(LATEST_PRIVACY_VERSION).toBeGreaterThanOrEqual(1);
  });
});
