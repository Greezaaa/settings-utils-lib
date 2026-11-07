import { Injectable } from '@angular/core';
import { frequencyOf, Note } from '../games/music-notes';

/** How long a note sounds, and the pause between two notes played one after the other */
const NOTE_SECONDS = 0.9;
const GAP_SECONDS = 0.25;
/** A soft, bell-like tone: the note and two quieter harmonics */
const HARMONICS: readonly { readonly multiple: number; readonly volume: number }[] = [
  { multiple: 1, volume: 0.5 },
  { multiple: 2, volume: 0.15 },
  { multiple: 3, volume: 0.05 },
];

/**
 * Plays notes with the Web Audio API: no sound files, every tone is made in the browser. The audio context is
 * created on the first note, which always follows a tap, as browsers only allow sound after one.
 */
@Injectable({ providedIn: 'root' })
export class NotePlayer {
  private context: AudioContext | null = null;

  /** The browser's audio context, shared with the microphone listener */
  audioContext(): AudioContext {
    this.context ??= new AudioContext();
    void this.context.resume();
    return this.context;
  }

  /** Plays notes one after the other; resolves when the last one has faded */
  play(...notes: Note[]): Promise<void> {
    const context = this.audioContext();
    notes.forEach((note, index) =>
      this.tone(context, note, context.currentTime + index * (NOTE_SECONDS + GAP_SECONDS)),
    );
    const seconds = notes.length * (NOTE_SECONDS + GAP_SECONDS);
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  private tone(context: AudioContext, note: Note, start: number): void {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(1, start + 0.02);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + NOTE_SECONDS);
    envelope.connect(context.destination);
    for (const { multiple, volume } of HARMONICS) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequencyOf(note) * multiple;
      gain.gain.value = volume;
      oscillator.connect(gain).connect(envelope);
      oscillator.start(start);
      oscillator.stop(start + NOTE_SECONDS);
    }
  }
}
