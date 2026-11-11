import { inject, Injectable, signal } from '@angular/core';
import { detectPitch } from '../games/music-notes';
import { NotePlayer } from './note-player';

/** Samples looked at each time: about 46 ms of sound at 44.1 kHz, long enough for a low voice */
const WINDOW_SIZE = 2048;

export type MicrophoneState = 'off' | 'asking' | 'listening' | 'denied' | 'unavailable';

/**
 * Listens to the microphone and works out the pitch of what it hears, many times a second. The sound is only
 * analysed in memory on the device: it is never recorded, saved or sent anywhere. The microphone is on only
 * between `start()` and `stop()`, and the browser shows that it is in use.
 */
@Injectable({ providedIn: 'root' })
export class PitchListener {
  private readonly player = inject(NotePlayer);
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private frame = 0;

  readonly state = signal<MicrophoneState>('off');
  /**
   * The pitch heard just now, in hertz, or null in silence. Updated on every reading, even when the value is the
   * same, so whatever times a steady note (like holding it in tune) keeps counting.
   */
  readonly pitch = signal<number | null>(null, { equal: () => false });

  async start(): Promise<void> {
    if (this.stream) {
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.state.set('unavailable');
      return;
    }
    this.state.set('asking');
    try {
      // The browser's voice processing would bend the pitch, so it is turned off
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch (error) {
      this.state.set(error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'unavailable');
      return;
    }
    const context = this.player.audioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = WINDOW_SIZE;
    this.source = context.createMediaStreamSource(this.stream);
    this.source.connect(analyser);
    const samples = new Float32Array(WINDOW_SIZE);
    const listen = () => {
      analyser.getFloatTimeDomainData(samples);
      this.pitch.set(detectPitch(samples, context.sampleRate));
      this.frame = requestAnimationFrame(listen);
    };
    this.state.set('listening');
    listen();
  }

  stop(): void {
    cancelAnimationFrame(this.frame);
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.source = null;
    this.pitch.set(null);
    if (this.state() === 'listening' || this.state() === 'asking') {
      this.state.set('off');
    }
  }
}
