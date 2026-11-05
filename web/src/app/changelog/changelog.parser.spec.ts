import { describe, expect, it } from 'vitest';
import { latestRelease, parseChangelog, parseInline } from './changelog.parser';

const CHANGELOG = `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Something new

## [1.1.0] - 2026-11-05

First stable release.

### Changed
- Moved to \`@su-labs/core\`
  across two lines
- **BREAKING:** requires Angular 22

### Fixed
- See [the issue](https://github.com/Greezaaa/settings-utils-lib/issues/1)

## [1.0.0] - 2026-11-04
- Initial release
`;

describe('parseChangelog', () => {
  const releases = parseChangelog(CHANGELOG);

  it('should read every release with its version and date', () => {
    expect(releases.map((release) => [release.version, release.date])).toEqual([
      ['Unreleased', null],
      ['1.1.0', '2026-11-05'],
      ['1.0.0', '2026-11-04'],
    ]);
  });

  it('should group items by section and keep notes before the first section', () => {
    const [, release] = releases;

    expect(release.notes).toEqual([[{ kind: 'text', text: 'First stable release.' }]]);
    expect(release.sections.map((section) => [section.title, section.items.length])).toEqual([
      ['Changed', 2],
      ['Fixed', 1],
    ]);
  });

  it('should join wrapped list items', () => {
    expect(releases[1].sections[0].items[0]).toEqual([
      { kind: 'text', text: 'Moved to ' },
      { kind: 'code', text: '@su-labs/core' },
      { kind: 'text', text: ' across two lines' },
    ]);
  });

  it('should put list items without a section in an untitled section', () => {
    expect(releases[2].sections).toEqual([{ title: '', items: [[{ kind: 'text', text: 'Initial release' }]] }]);
  });

  it('should return no releases for empty text', () => {
    expect(parseChangelog('')).toEqual([]);
  });
});

describe('parseInline', () => {
  it('should read bold text and links', () => {
    expect(parseInline('**Note:** see [docs](https://example.com/docs).')).toEqual([
      { kind: 'strong', text: 'Note:' },
      { kind: 'text', text: ' see ' },
      { kind: 'link', text: 'docs', href: 'https://example.com/docs' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('should keep links that are not http(s) as plain text', () => {
    expect(parseInline('[bad](javascript:void)')).toEqual([{ kind: 'text', text: '[bad](javascript:void)' }]);
  });
});

describe('latestRelease', () => {
  it('should skip Unreleased', () => {
    expect(latestRelease(parseChangelog(CHANGELOG))?.version).toBe('1.1.0');
  });

  it('should return null when nothing is released', () => {
    expect(latestRelease([])).toBeNull();
  });
});
