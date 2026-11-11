import { describe, expect, it } from 'vitest';
import { EN } from './en';
import { spanish } from './es';
import { translate } from './translate-pipe';

describe('translate', () => {
  it('reads a text by its dotted path', () => {
    expect(translate(EN, 'rooms.showScores')).toBe(EN.rooms.showScores);
    expect(translate(spanish('boy'), 'rooms.showScores')).toBe('Puntuación durante la ronda');
  });

  it('calls a function message with the arguments', () => {
    expect(translate(EN, 'rooms.players', 2, 4)).toBe('Players 2/4');
  });

  it('returns a group of texts, to index by a value', () => {
    expect(translate(EN, 'games')['how-many'].name).toBe(EN.games['how-many'].name);
  });
});
