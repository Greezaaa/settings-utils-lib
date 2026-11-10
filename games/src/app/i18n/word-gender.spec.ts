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

  it('writes each player’s status in a room to match that player, whoever is looking', () => {
    expect(spanish('boy').rooms.ready('girl')).toBe('Lista');
    expect(spanish('girl').rooms.host('boy')).toBe('Anfitrión');
    expect(spanish('girl').rooms.notReady(null)).toBe('No está listo');
    expect(italian('girl').pictureGames.ready).toBe('Pronta');
  });
});
