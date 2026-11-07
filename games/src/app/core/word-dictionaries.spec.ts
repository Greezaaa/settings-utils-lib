import { describe, expect, it } from 'vitest';
import { dictionaryUrl, parseDictionary } from './word-dictionaries';

describe('word dictionaries', () => {
  it('reads one word per line, skipping blank lines', () => {
    expect([...parseDictionary('casa\nperro\n\n gato \n')]).toEqual(['casa', 'perro', 'gato']);
  });

  it('asks for the current version of a language’s file', () => {
    expect(dictionaryUrl('uk')).toMatch(/^\/dictionaries\/uk\.txt\?v=\d+$/);
  });
});
