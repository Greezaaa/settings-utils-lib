import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, linkedSignal, output, signal, untracked } from '@angular/core';
import { NotePlayer } from '../../../../core/note-player';
import { PitchListener } from '../../../../core/pitch-listener';
import { centsFrom, Note } from '../../../../games/music-notes';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

const HOLD_MS = 1000;
const METER_CENTS = 300;

@Component({
  selector: 'app-sing-round',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sing-round.html',
  styleUrl: '../note-round.scss',
})
export class SingRound {
  readonly note = input.required<Note>();
  readonly tolerance = input.required<number>();
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly player = inject(NotePlayer);
  protected readonly listener = inject(PitchListener);

  protected readonly isDone = linkedSignal({ source: this.note, computation: () => false });
  protected readonly cents = computed(() => {
    const pitch = this.listener.pitch();
    return pitch === null || this.player.isPlaying() ? null : centsFrom(pitch, this.note());
  });
  protected readonly isInTune = computed(() => {
    const cents = this.cents();
    return cents !== null && Math.abs(cents) <= this.tolerance();
  });
  protected readonly hint = computed<'done' | 'silent' | 'hold' | 'low' | 'high'>(() => {
    const cents = this.cents();
    if (this.isDone()) {
      return 'done';
    }
    if (cents === null) {
      return 'silent';
    }
    return this.isInTune() ? 'hold' : cents < 0 ? 'low' : 'high';
  });
  protected readonly needle = computed(() => {
    const cents = Math.max(-METER_CENTS, Math.min(METER_CENTS, this.cents() ?? 0));
    return 50 + (cents / METER_CENTS) * 50;
  });
  protected readonly band = computed(() => (this.tolerance() / METER_CENTS) * 100);
  protected readonly held = signal(0);
  private inTuneSince: number | null = null;

  constructor() {
    effect(() => {
      const note = this.note();
      untracked(() => this.listen(note));
    });
    effect(() => {
      const inTune = this.isInTune();
      this.listener.pitch();
      untracked(() => this.track(inTune));
    });
    inject(DestroyRef).onDestroy(() => this.listener.stop());
  }

  protected listen(note = this.note()): void {
    void this.player.play(note);
  }

  protected startSinging(): void {
    void this.listener.start();
  }

  protected skip(): void {
    if (!this.isDone()) {
      this.isDone.set(true);
      this.mistake.emit();
      this.solved.emit();
    }
  }

  private track(inTune: boolean): void {
    if (this.isDone()) {
      return;
    }
    if (!inTune) {
      this.inTuneSince = null;
      this.held.set(0);
      return;
    }
    const now = performance.now();
    this.inTuneSince ??= now;
    const held = Math.min(1, (now - this.inTuneSince) / HOLD_MS);
    this.held.set(held);
    if (held === 1) {
      this.isDone.set(true);
      this.solved.emit();
    }
  }
}
