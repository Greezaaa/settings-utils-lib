import { inject, Injectable, signal } from '@angular/core';
import { detectPitch } from '../games/music-notes';
import { NotePlayer } from './note-player';

const WINDOW_SIZE = 2048;

export type MicrophoneState = 'off' | 'asking' | 'listening' | 'denied' | 'unavailable';

@Injectable({ providedIn: 'root' })
export class PitchListener {
  private readonly player = inject(NotePlayer);
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private frame = 0;

  readonly state = signal<MicrophoneState>('off');
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
