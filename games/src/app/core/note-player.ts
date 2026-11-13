import { computed, Injectable, signal } from '@angular/core';
import { frequencyOf, Note } from '../games/music-notes';

const NOTE_SECONDS = 0.9;
const GAP_SECONDS = 0.25;
const HARMONICS: readonly { readonly multiple: number; readonly volume: number }[] = [
  { multiple: 1, volume: 0.5 },
  { multiple: 2, volume: 0.15 },
  { multiple: 3, volume: 0.05 },
];

@Injectable({ providedIn: 'root' })
export class NotePlayer {
  private context: AudioContext | null = null;
  private readonly sounding = signal(0);

  readonly isPlaying = computed(() => this.sounding() > 0);

  audioContext(): AudioContext {
    this.context ??= new AudioContext();
    void this.context.resume();
    return this.context;
  }

  play(...notes: Note[]): Promise<void> {
    const context = this.audioContext();
    notes.forEach((note, index) =>
      this.tone(context, note, context.currentTime + index * (NOTE_SECONDS + GAP_SECONDS)),
    );
    const seconds = notes.length * (NOTE_SECONDS + GAP_SECONDS);
    this.sounding.update((count) => count + 1);
    return new Promise((resolve) =>
      setTimeout(() => {
        this.sounding.update((count) => count - 1);
        resolve();
      }, seconds * 1000),
    );
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
