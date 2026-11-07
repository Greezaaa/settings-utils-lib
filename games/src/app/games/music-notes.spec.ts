import { describe, expect, it } from 'vitest';
import { centsFrom, detectPitch, findTheNoteRounds, frequencyOf, getMusicLevel, higherOrLowerRound, midiOf, MUSIC_LEVELS, noteOfMidi, singItRounds } from './music-notes';
import { Random } from './random';

function seeded(seed = 1): Random {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

/** A sound with harmonics, like a voice or an instrument */
function tone(frequency: number, sampleRate = 44_100, length = 2048, harmonics = [1, 0.5, 0.25]): Float32Array {
  return Float32Array.from(
    { length },
    (_, index) =>
      harmonics.reduce(
        (sum, strength, harmonic) =>
          sum + strength * Math.sin((2 * Math.PI * frequency * (harmonic + 1) * index) / sampleRate),
        0,
      ) * 0.3,
  );
}

describe('music notes', () => {
  it('tunes A4 to 440 Hz and middle C to about 261.6 Hz', () => {
    expect(frequencyOf({ id: 'A', octave: 4 })).toBe(440);
    expect(frequencyOf({ id: 'C', octave: 4 })).toBeCloseTo(261.63, 1);
    expect(midiOf({ id: 'C', octave: 4 })).toBe(60);
    expect(noteOfMidi(61)).toEqual({ id: 'C#', octave: 4 });
  });

  it('plays only the level’s notes in Find the note', () => {
    const easy = getMusicLevel('easy');
    expect(findTheNoteRounds(easy, seeded()).every(({ id }) => easy.notes.includes(id))).toBe(true);
  });

  it('keeps the two notes of Higher or lower at least the level’s gap apart', () => {
    for (const level of MUSIC_LEVELS) {
      const random = seeded(7);
      for (let round = 0; round < 50; round++) {
        const { first, second, answer } = higherOrLowerRound(level, random);
        const gap = midiOf(second) - midiOf(first);
        expect(Math.abs(gap)).toBeGreaterThanOrEqual(level.minGap);
        expect(answer).toBe(gap > 0 ? 'higher' : 'lower');
      }
    }
  });

  it('never asks to sing the same note twice in a row', () => {
    const notes = singItRounds(getMusicLevel('normal'), seeded(3));
    expect(notes.every((note, index) => index === 0 || note.id !== notes[index - 1].id)).toBe(true);
  });

  it('measures how far a sung note is, in any octave', () => {
    const a4 = { id: 'A', octave: 4 } as const;
    expect(centsFrom(440, a4)).toBeCloseTo(0);
    expect(centsFrom(220, a4)).toBeCloseTo(0);
    expect(centsFrom(880 * 2 ** (30 / 1200), a4)).toBeCloseTo(30);
    expect(centsFrom(440 * 2 ** (-1 / 12), a4)).toBeCloseTo(-100);
  });

  it('hears the pitch of a clear note, low or high', () => {
    for (const frequency of [110, 196, 261.63, 440, 659.25]) {
      expect(detectPitch(tone(frequency), 44_100)).toBeCloseTo(frequency, 0);
    }
  });

  it('ignores silence and noise', () => {
    expect(detectPitch(new Float32Array(2048), 44_100)).toBeNull();
    const random = seeded(5);
    const noise = Float32Array.from({ length: 2048 }, () => random() - 0.5);
    expect(detectPitch(noise, 44_100)).toBeNull();
  });
});
