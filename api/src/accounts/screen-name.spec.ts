import { describe, expect, it } from 'vitest';
import { comparableWord, isRudeName, screenNameSchema } from './screen-name.js';

describe('screenNameSchema', () => {
  it('takes one word of 3 to 12 letters in any alphabet', () => {
    for (const name of ['Lucía', 'Ñandú', 'Олена', 'Max']) {
      expect(screenNameSchema.safeParse(name).success).toBe(true);
    }
  });

  it('refuses digits, spaces, symbols and names too short or long', () => {
    for (const name of [
      'lucia2015',
      'Super Max',
      'max_99',
      'p1t0',
      'Al',
      'Supercalifragi',
    ]) {
      expect(screenNameSchema.safeParse(name).success).toBe(false);
    }
  });
});

describe('isRudeName', () => {
  const rude = ['puta', 'merda'];

  it('finds a rude word dressed up with capitals, accents or repeated letters', () => {
    expect(comparableWord('PUUUTÁ')).toBe('puta');
    expect(isRudeName('Puuta', rude)).toBe(true);
    expect(isRudeName('MÉRDA', rude)).toBe(true);
  });

  it('lets through a name that only contains a rude word', () => {
    expect(isRudeName('Disputa', rude)).toBe(false);
  });
});
