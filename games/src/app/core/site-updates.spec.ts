import { describe, expect, it } from 'vitest';
import { formatMoment, groupNews, latestPrivacyVersion, latestPublished, latestVersion, NewsItem, recentChanges, SiteUpdate } from './site-updates';

const text = (word: string) => ({ en: word, es: word, eu: word, it: word, uk: word });
const UPDATES: readonly SiteUpdate[] = [
  { version: 1, published: '2026-01-01T10:00:00Z', privacy: true, changes: [{ kind: 'feature', text: text('One') }] },
  {
    version: 2,
    published: '2026-02-01T10:00:00Z',
    changes: [
      { kind: 'game', text: text('Two'), game: 'math-games' },
      { kind: 'settings', text: text('Three') },
    ],
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

  it('groups news items into updates by version, oldest first', () => {
    const items: NewsItem[] = [
      { version: 2, published: '2026-02-01T10:00:00Z', privacy: false, change: { kind: 'game', text: text('Two'), game: 'math-games' } },
      { version: 1, published: '2026-01-01T10:00:00Z', privacy: true, change: { kind: 'feature', text: text('One') } },
      { version: 2, published: '2026-02-01T10:00:00Z', privacy: false, change: { kind: 'settings', text: text('Three') } },
    ];
    expect(groupNews(items)).toEqual([
      { version: 1, published: '2026-01-01T10:00:00Z', privacy: true, changes: [{ kind: 'feature', text: text('One') }] },
      {
        version: 2,
        published: '2026-02-01T10:00:00Z',
        privacy: undefined,
        changes: [
          { kind: 'game', text: text('Two'), game: 'math-games' },
          { kind: 'settings', text: text('Three') },
        ],
      },
    ]);
  });

  it('knows the latest version, privacy version and date, with safe values before any news is known', () => {
    expect(latestVersion(UPDATES)).toBe(2);
    expect(latestPrivacyVersion(UPDATES)).toBe(1);
    expect(latestPublished(UPDATES)).toBe('2026-02-01T10:00:00Z');
    expect(latestVersion([])).toBe(0);
    expect(latestPrivacyVersion([])).toBe(1);
    expect(latestPublished([])).toBeNull();
  });

  it('formats a moment as a local date and time', () => {
    expect(formatMoment('2026-11-07T16:30:00+01:00', 'en')).toMatch(/2026/);
  });
});
