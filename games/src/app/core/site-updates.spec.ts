import { describe, expect, it } from 'vitest';
import { changesIn, formatMoment, LATEST_PRIVACY_VERSION, LATEST_PUBLISHED, LATEST_VERSION, SITE_UPDATES, SiteUpdate, updatesSince } from './site-updates';

const text = (word: string) => ({ en: word, es: word, eu: word });
const UPDATES: readonly SiteUpdate[] = [
  { version: 1, published: '2026-01-01T10:00:00Z', privacy: true, changes: [{ text: text('One') }] },
  {
    version: 2,
    published: '2026-02-01T10:00:00Z',
    changes: [{ text: text('Two'), game: 'math-games' }, { text: text('Three') }],
  },
];

describe('site updates', () => {
  it('lists only the updates after the last one seen', () => {
    expect(updatesSince(0, UPDATES).map(({ version }) => version)).toEqual([1, 2]);
    expect(updatesSince(1, UPDATES).map(({ version }) => version)).toEqual([2]);
    expect(updatesSince(2, UPDATES)).toEqual([]);
  });

  it('gathers their changes, oldest first', () => {
    expect(changesIn(UPDATES).map((change) => change.text.en)).toEqual(['One', 'Two', 'Three']);
  });

  it('formats a moment as a local date and time', () => {
    expect(formatMoment('2026-11-07T16:30:00+01:00', 'en')).toMatch(/2026/);
  });

  it('keeps versions counting up, times in order and valid', () => {
    SITE_UPDATES.forEach((update, index) => {
      expect(update.version).toBe(index + 1);
      expect(Number.isNaN(Date.parse(update.published))).toBe(false);
      const previous = SITE_UPDATES[index - 1];
      expect(!previous || Date.parse(update.published) >= Date.parse(previous.published)).toBe(true);
    });
    expect(LATEST_VERSION).toBe(SITE_UPDATES.length);
    expect(LATEST_PUBLISHED).toBe(SITE_UPDATES[SITE_UPDATES.length - 1].published);
    expect(LATEST_PRIVACY_VERSION).toBeGreaterThanOrEqual(1);
  });
});
