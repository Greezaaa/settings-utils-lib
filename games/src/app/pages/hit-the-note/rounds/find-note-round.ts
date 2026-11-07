import { ChangeDetectionStrategy, Component, effect, inject, input, linkedSignal, output, untracked } from '@angular/core';
import { NotePlayer } from '../../../core/note-player';
import { isSharp, Note, NoteId, PLAY_OCTAVE } from '../../../games/music-notes';
import { SiteLanguage } from '../../../i18n/site-language';
import { roundFeedback } from '../../../shared/round-feedback';

/**
 * Find the note: a note plays, the player taps its name. A wrong tap plays the tapped note, so the two can be
 * compared, and counts a mistake; the right one ends the round.
 */
@Component({
  selector: 'app-find-note-round',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-note-round.html',
  styleUrl: './note-round.scss',
})
export class FindNoteRound {
  readonly note = input.required<Note>();
  readonly choices = input.required<readonly NoteId[]>();
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly player = inject(NotePlayer);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly feedback = roundFeedback();
  protected readonly isSharp = isSharp;
  /** The right note was tapped; resets with each note */
  protected readonly isDone = linkedSignal({ source: this.note, computation: () => false });

  constructor() {
    // Each new note plays as soon as it is shown
    effect(() => {
      const note = this.note();
      untracked(() => void this.player.play(note));
    });
  }

  protected listen(): void {
    void this.player.play(this.note());
  }

  protected tap(id: NoteId): void {
    if (this.isDone() || this.feedback.isWrong() || this.player.isPlaying()) {
      return;
    }
    if (id === this.note().id) {
      this.isDone.set(true);
      this.solved.emit();
      return;
    }
    void this.player.play({ id, octave: PLAY_OCTAVE });
    this.mistake.emit();
    this.feedback.wrong();
  }
}
