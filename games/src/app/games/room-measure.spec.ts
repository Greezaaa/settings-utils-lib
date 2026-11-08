import { describe, expect, it } from 'vitest';
import { roomMeasure, roomMeasureExercises } from './room-measure';

describe('room measure', () => {
  it('keeps known settings and falls back on unknown ones', () => {
    expect(roomMeasure('number-line', 'hard')).toEqual({
      mode: 'number-line',
      levelId: 'hard',
    });
    expect(roomMeasure('true-or-false', 'nope')).toEqual({
      mode: 'read-angle',
      levelId: 'easy',
    });
  });

  it('gives every device the same exercises from the round’s seed', () => {
    const settings = roomMeasure('fill-glass', 'normal');
    expect(roomMeasureExercises(settings, 42)).toEqual(
      roomMeasureExercises(settings, 42)
    );
    expect(roomMeasureExercises(settings, 42)).not.toEqual(
      roomMeasureExercises(settings, 43)
    );
  });
});
