import { describe, expect, it } from 'vitest';
import { formatDay, formatMoment, LATEST_PRIVACY_VERSION, LATEST_PUBLISHED, LATEST_VERSION, recentChanges, SITE_UPDATES, SiteUpdate } from './site-updates';

const text = (word: string) => ({ en: word, es: word, eu: word, uk: word });
const UPDATES: readonly SiteUpdate[] = [
  { version: 1, published: '2026-01-01T10:00:00Z', privacy: true, changes: [{ text: text('One') }] },
  {
    version: 2,
    published: '2026-02-01T10:00:00Z',
    changes: [{ text: text('Two'), game: 'math-games' }, { text: text('Three') }],
  },
];

describe('site updates', () => {
  it('lists every change, newest update first, keeping each update’s order', () => {
    expect(recentChanges(UPDATES).map(({ change, version }) => `${version}:${change.text.en}`)).toEqual([
      '2:Two',
      '2:Three',
      '1:One',
    ]);
    expect(recentChanges(UPDATES)[0].published).toBe('2026-02-01T10:00:00Z');
  });

  it('formats a day', () => {
    expect(formatDay('2026-11-07T16:30:00+01:00', 'en')).toMatch(/2026/);
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
