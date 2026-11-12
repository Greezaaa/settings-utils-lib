import { describe, expect, it } from 'vitest';
import { ROOM_GAMES } from '../core/features';
import { scramble } from './turn-picture';
import { ROOM_CHOICES, roomChoice, roomLetters, roomPicture, roomRandom, roomSliding, scoreAfterAnswer } from './room-games';
import { roomWords } from './room-letters';
import { tilesInPlace } from './sliding-puzzle';
import { WORD_BANKS } from './words';

describe('room choices', () => {
  it('starts every room game on a mode and level it has', () => {
    for (const game of ROOM_GAMES) {
      const { mode, level } = roomChoice(game, '', '');
      expect(ROOM_CHOICES[game].modes).toContain(mode);
      expect(ROOM_CHOICES[game].levelsOf(mode)).toContain(level);
    }
  });

  it('keeps known choices, and a level the new mode lacks falls back', () => {
    expect(roomChoice('letter-games', 'word-builder', 'hard')).toEqual({ mode: 'word-builder', level: 'hard' });
    expect(roomChoice('letter-games', 'mixed-letters', 'hard')).toEqual({ mode: 'mixed-letters', level: 'hints' });
    expect(roomChoice('turn-picture', 'memory', 'nope')).toEqual({ mode: 'memory', level: 'normal' });
  });

  it('reads each game’s settings for its round', () => {
    expect(roomLetters('missing-vowels', 'no-hints')).toMatchObject({ mode: 'missing-vowels', hints: false });
    expect(roomLetters('word-builder', 'normal').builderLevel.letters).toBe(7);
    expect(roomPicture('place-pieces', 'look', 'hard').level).toMatchObject({ rows: 4, columns: 4 });
    expect(roomSliding('drawing', 'easy')).toMatchObject({ pictureMode: 'drawing', level: { id: 'easy' } });
  });
});

describe('room rounds', () => {
  it('gives every device the same puzzles and words from the round’s seed', () => {
    const level = roomPicture('turn-picture', 'look', 'normal').level;
    expect(scramble(level, roomRandom(42, 3))).toEqual(scramble(level, roomRandom(42, 3)));
    expect(scramble(level, roomRandom(42, 3))).not.toEqual(scramble(level, roomRandom(42, 4)));
    const letters = roomLetters('mixed-letters', 'hints');
    expect(roomWords(letters, WORD_BANKS.es, 7)).toEqual(roomWords(letters, WORD_BANKS.es, 7));
  });

  it('counts the sliding puzzle’s tiles in their own cell', () => {
    expect(tilesInPlace([0, 2, 1, null])).toBe(1);
    expect(tilesInPlace([0, 1, 2, null])).toBe(3);
  });
});

describe('scoreAfterAnswer', () => {
  it('adds a point for a right answer and takes one off for a wrong one, never below zero', () => {
    expect(scoreAfterAnswer(3, true)).toBe(4);
    expect(scoreAfterAnswer(3, false)).toBe(2);
    expect(scoreAfterAnswer(0, false)).toBe(0);
  });

  it('makes guessing true or false at random worth nothing on average', () => {
    const guesses = [true, false, true, false, true, false];
    expect(guesses.reduce(scoreAfterAnswer, 0)).toBeLessThanOrEqual(1);
  });
});
