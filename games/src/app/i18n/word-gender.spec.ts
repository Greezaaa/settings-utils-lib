import { describe, expect, it } from 'vitest';
import { ES, spanish } from './es';
import { italian } from './it';
import { ukrainian } from './uk';
import { forGender } from './word-gender';

describe('word gender', () => {
  it('picks the boy’s or the girl’s form', () => {
    expect(forGender('boy', 'listo', 'lista')).toBe('listo');
    expect(forGender('girl', 'listo', 'lista')).toBe('lista');
  });

  it('speaks to the player as they chose, and as always until they do', () => {
    expect(ES.rooms.imReady).toBe('Estoy listo');
    expect(spanish('girl').rooms.imReady).toBe('Estoy lista');
    expect(italian('girl').climbTower.fell).toBe('Sei caduta!');
    expect(italian('girl').howMany.great).toBe('Bravissima!');
    expect(ukrainian('girl').account.signedInAs('Ana')).toBe('Ти увійшла як Ana');
    expect(ukrainian('boy').account.forgotTab).toBe('Я забув пароль');
  });

  it('keeps what other players see as it was', () => {
    // A room's player list shows everyone's status, whoever is looking
    expect(spanish('girl').rooms.ready).toBe(spanish('boy').rooms.ready);
  });
});
