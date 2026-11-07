import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, linkedSignal, output, signal, untracked } from '@angular/core';
import { NotePlayer } from '../../../core/note-player';
import { PitchListener } from '../../../core/pitch-listener';
import { centsFrom, Note } from '../../../games/music-notes';
import { SiteLanguage } from '../../../i18n/site-language';

/** How long the singer has to stay in tune for the round to count */
const HOLD_MS = 1000;
/** Widest miss the meter shows, in cents; beyond it the needle stays at the edge */
const METER_CENTS = 300;

/**
 * Sing it: a note plays, the player sings it. The microphone's pitch is compared with the note on the device,
 * in any octave; staying within the level's tolerance for a second ends the round. The microphone's sound is
 * ignored while the note itself plays, so the speaker can't sing for the player.
 */
@Component({
  selector: 'app-sing-round',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sing-round.html',
  styleUrl: './note-round.scss',
})
export class SingRound {
  readonly note = input.required<Note>();
  /** How far off still counts, in cents */
  readonly tolerance = input.required<number>();
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly player = inject(NotePlayer);
  protected readonly listener = inject(PitchListener);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly isDone = linkedSignal({ source: this.note, computation: () => false });
  /** How far the voice is from the note right now, while the note isn't playing */
  protected readonly cents = computed(() => {
    const pitch = this.listener.pitch();
    return pitch === null || this.player.isPlaying() ? null : centsFrom(pitch, this.note());
  });
  protected readonly isInTune = computed(() => {
    const cents = this.cents();
    return cents !== null && Math.abs(cents) <= this.tolerance();
  });
  /** What to tell the singer */
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
  /** Where the needle points: 0% far too low, 50% right, 100% far too high */
  protected readonly needle = computed(() => {
    const cents = Math.max(-METER_CENTS, Math.min(METER_CENTS, this.cents() ?? 0));
    return 50 + (cents / METER_CENTS) * 50;
  });
  /** The in-tune band around the middle of the meter, as a share of its width */
  protected readonly band = computed(() => (this.tolerance() / METER_CENTS) * 100);
  /** Share of the hold time sung in tune so far */
  protected readonly held = signal(0);
  private inTuneSince: number | null = null;

  constructor() {
    effect(() => {
      const note = this.note();
      untracked(() => this.listen(note));
    });
    // Counts how long the voice stays in tune; leaving the band starts over
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

  /** For players who can't sing now (no microphone, a quiet place…): counts as a mistake and moves on */
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
