import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEATURE_IDS, GAME_CATEGORIES, GAME_SLUGS, LANGUAGE_IDS, UPDATE_KINDS } from './catalog.js';

const gamesApp = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  'games',
  'src',
  'app',
);

function unionValues(file: string, typeName: string): string[] {
  const source = readFileSync(join(gamesApp, file), 'utf8');
  const union =
    new RegExp(`type ${typeName} =([^;]+);`).exec(source)?.[1] ?? '';
  return [...union.matchAll(/'([^']+)'/g)].map(([, value]) => value);
}

describe('catalog', () => {
  it('knows the same games as the games site', () => {
    expect([...GAME_SLUGS].sort()).toEqual(
      unionValues('core/games.ts', 'GameSlug').sort(),
    );
  });

  it('knows the same categories as the games site', () => {
    expect([...GAME_CATEGORIES].sort()).toEqual(
      unionValues('core/games.ts', 'GameCategory').sort(),
    );
  });

  it('knows the same kinds of news as the games site', () => {
    const source = readFileSync(join(gamesApp, 'core/site-updates.ts'), 'utf8');
    const list = /UPDATE_KINDS = \[([^\]]+)\]/.exec(source)?.[1] ?? '';
    expect([...UPDATE_KINDS]).toEqual([...list.matchAll(/'([^']+)'/g)].map(([, value]) => value));
  });

  it('knows the same languages as the games site', () => {
    expect([...LANGUAGE_IDS].sort()).toEqual(
      unionValues('i18n/site-messages.ts', 'LanguageId').sort(),
    );
  });

  it('knows the same features as the games site', () => {
    expect([...FEATURE_IDS].sort()).toEqual(
      unionValues('core/features.ts', 'FeatureId').sort(),
    );
  });
});
