import { pick, Random, shuffled } from './random';

/**
 * Hit the note: rules only, no Angular or Web Audio, so they can be tested on their own.
 *
 * - Find the note: hear a note, tap its name.
 * - Higher or lower: hear two notes, say whether the second is higher or lower.
 * - Sing it: hear a note and sing it; the microphone's pitch is compared with it on the device.
 */
export type MusicModeId = 'find-the-note' | 'higher-or-lower' | 'sing-it';
export const MUSIC_MODE_IDS: readonly MusicModeId[] = ['find-the-note', 'higher-or-lower', 'sing-it'];

/** The twelve notes of an octave, by their English letter; each language names them in i18n/ */
export type NoteId = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export const NOTE_IDS: readonly NoteId[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** A note to play: which one, and in which octave (middle C is C4) */
export interface Note {
  readonly id: NoteId;
  readonly octave: number;
}

/** The octave the games play in, comfortable for children's voices */
export const PLAY_OCTAVE = 4;
export const ROUNDS_PER_GAME = 10;

export type MusicLevelId = 'easy' | 'normal' | 'hard' | 'expert';
export interface MusicLevel {
  readonly id: MusicLevelId;
  /** Notes Find the note uses */
  readonly notes: readonly NoteId[];
  /** Smallest gap between the two notes of Higher or lower, in semitones */
  readonly minGap: number;
  /** How far off a sung note may be and still count, in cents (100 cents = one semitone) */
  readonly tolerance: number;
}
export const MUSIC_LEVELS: readonly MusicLevel[] = [
  { id: 'easy', notes: ['C', 'D', 'E'], minGap: 5, tolerance: 50 },
  { id: 'normal', notes: ['C', 'D', 'E', 'F', 'G'], minGap: 3, tolerance: 40 },
  { id: 'hard', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'], minGap: 2, tolerance: 30 },
  { id: 'expert', notes: NOTE_IDS, minGap: 1, tolerance: 20 },
];

export function getMusicLevel(id: MusicLevelId): MusicLevel {
  return MUSIC_LEVELS.find((level) => level.id === id) ?? MUSIC_LEVELS[0];
}

/** The note's number on the MIDI scale: middle C (C4) is 60, the A above it 69 */
export const midiOf = ({ id, octave }: Note): number => (octave + 1) * 12 + NOTE_IDS.indexOf(id);

/** The note's frequency in hertz, with A4 tuned to 440 Hz */
export const frequencyOf = (note: Note): number => 440 * 2 ** ((midiOf(note) - 69) / 12);

/** Whether a note is one of the black keys (C♯, D♯…) */
export const isSharp = (id: NoteId): boolean => id.endsWith('#');

/** Find the note: the notes to play, one per round */
export function findTheNoteRounds(level: MusicLevel, random: Random, count = ROUNDS_PER_GAME): Note[] {
  return Array.from({ length: count }, () => ({ id: pick(level.notes, random), octave: PLAY_OCTAVE }));
}

export type Direction = 'higher' | 'lower';
export interface HigherOrLowerRound {
  readonly first: Note;
  readonly second: Note;
  readonly answer: Direction;
}

/** Two notes from the octave and the next, at least the level's gap apart */
export function higherOrLowerRound(level: MusicLevel, random: Random): HigherOrLowerRound {
  const lowest = midiOf({ id: 'C', octave: PLAY_OCTAVE });
  const range = 18;
  const first = lowest + Math.floor(random() * range);
  const gaps = Array.from({ length: 7 - level.minGap + 1 }, (_, index) => level.minGap + index);
  const gap = pick(gaps, random);
  const goesUp = first + gap <= lowest + range && (first - gap < lowest || random() < 0.5);
  const second = goesUp ? first + gap : first - gap;
  return { first: noteOfMidi(first), second: noteOfMidi(second), answer: goesUp ? 'higher' : 'lower' };
}

export function noteOfMidi(midi: number): Note {
  return { id: NOTE_IDS[((midi % 12) + 12) % 12], octave: Math.floor(midi / 12) - 1 };
}

/** Sing it: the notes to sing, each different from the one before */
export function singItRounds(level: MusicLevel, random: Random, count = ROUNDS_PER_GAME): Note[] {
  const notes: Note[] = [];
  let previous: NoteId | null = null;
  while (notes.length < count) {
    const id = pick(
      shuffled(level.notes, random).filter((note) => note !== previous),
      random,
    );
    notes.push({ id, octave: PLAY_OCTAVE });
    previous = id;
  }
  return notes;
}

/**
 * How far a sung frequency is from a note, in cents, in whichever octave the singer is in (so any voice counts):
 * from -600 to +600; negative is too low, positive too high.
 */
export function centsFrom(frequency: number, note: Note): number {
  const cents = 1200 * Math.log2(frequency / frequencyOf(note));
  return ((((cents + 600) % 1200) + 1200) % 1200) - 600;
}

/** Quietest sound worth listening to, as the root mean square of the samples */
const MIN_LOUDNESS = 0.01;
/** Lowest and highest pitches a voice makes (a low man's voice to a child's squeal) */
const MIN_VOICE_HZ = 70;
const MAX_VOICE_HZ = 1100;
/** How alike the sound must be to itself one period later to count as a clear note */
const MIN_CLARITY = 0.9;

/**
 * The pitch of a short piece of sound, in hertz, or null when it is too quiet or not a clear note.
 * Compares the sound with itself shifted by every possible period (autocorrelation) and takes the best match,
 * refined between samples.
 */
export function detectPitch(samples: Float32Array, sampleRate: number): number | null {
  const loudness = Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
  if (loudness < MIN_LOUDNESS) {
    return null;
  }
  const minLag = Math.floor(sampleRate / MAX_VOICE_HZ);
  const maxLag = Math.min(Math.ceil(sampleRate / MIN_VOICE_HZ), Math.floor(samples.length / 2));
  const correlation = (lag: number): number => {
    let sum = 0;
    let energy = 0;
    for (let index = 0; index + lag < samples.length; index++) {
      sum += samples[index] * samples[index + lag];
      energy += samples[index] * samples[index] + samples[index + lag] * samples[index + lag];
    }
    return energy === 0 ? 0 : (2 * sum) / energy;
  };
  const values = Array.from({ length: maxLag + 2 }, (_, lag) => (lag >= minLag - 1 ? correlation(lag) : 0));
  // The first peak that is nearly as strong as the strongest, so the fundamental wins over its multiples
  const strongest = Math.max(...values.slice(minLag, maxLag + 1));
  if (strongest < MIN_CLARITY) {
    return null;
  }
  let lag = minLag;
  while (lag <= maxLag && !(values[lag] >= strongest * 0.97 && values[lag] >= values[lag + 1])) {
    lag++;
  }
  // Fit a parabola through the peak and its neighbours to find it between samples
  const [before, peak, after] = [values[lag - 1], values[lag], values[lag + 1]];
  const shift = (after - before) / (2 * (2 * peak - before - after) || 1);
  return sampleRate / (lag + shift);
}
