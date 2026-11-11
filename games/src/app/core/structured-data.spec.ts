import { describe, expect, it } from 'vitest';
import { ES } from '../i18n/es';
import { structuredData } from './structured-data';

describe('structuredData', () => {
  it('describes the site on every page', () => {
    expect(JSON.stringify(structuredData(ES, 'su-labs games'))).toContain(ES.seo.siteDescription);
    expect(JSON.stringify(structuredData(ES, 'su-labs games'))).not.toContain('VideoGame');
  });

  it('adds the game on its page, in the page language', () => {
    const data = JSON.stringify(structuredData(ES, 'su-labs games', 'math-games'));
    expect(data).toContain('"VideoGame"');
    expect(data).toContain(ES.games['math-games'].name);
    expect(data).toContain('https://games.su-labs.dev/math-games/');
  });
});
