import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, untracked } from '@angular/core';
import { NotePlayer } from '../../../../core/note-player';
import { isSharp, Note, NoteId, PLAY_OCTAVE } from '../../../../games/music-notes';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { roundFeedback } from '../../../../shared/round-feedback';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

@Component({
  selector: 'app-find-note-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-note-round.html',
  styleUrl: '../note-round.scss',
})
export class FindNoteRound {
  readonly note = input.required<Note>();
  readonly choices = input.required<readonly NoteId[]>();
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly player = inject(NotePlayer);
  protected readonly feedback = roundFeedback();
  protected readonly isSharp = isSharp;
  protected readonly isDone = linkedSignal({ source: this.note, computation: () => false });
  private readonly missed = linkedSignal({ source: this.note, computation: () => false });
  protected readonly result = computed(() => (this.isDone() ? true : this.missed() ? false : null));

  constructor() {
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
      this.missed.set(false);
      this.isDone.set(true);
      this.solved.emit();
      return;
    }
    void this.player.play({ id, octave: PLAY_OCTAVE });
    this.mistake.emit();
    this.missed.set(true);
    this.feedback.wrong();
  }
}
