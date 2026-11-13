import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, untracked } from '@angular/core';
import { NotePlayer } from '../../../../core/note-player';
import { Direction, HigherOrLowerRound } from '../../../../games/music-notes';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

@Component({
  selector: 'app-higher-lower-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './higher-lower-round.html',
  styleUrl: '../note-round.scss',
})
export class HigherLowerRound {
  readonly round = input.required<HigherOrLowerRound>();
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly player = inject(NotePlayer);
  protected readonly directions: readonly Direction[] = ['lower', 'higher'];
  protected readonly given = linkedSignal({ source: this.round, computation: (): Direction | null => null });
  protected readonly result = computed(() => {
    const given = this.given();
    return given ? given === this.round().answer : null;
  });

  constructor() {
    effect(() => {
      const round = this.round();
      untracked(() => this.listen(round));
    });
  }

  protected listen(round = this.round()): void {
    void this.player.play(round.first, round.second);
  }

  protected answer(direction: Direction): void {
    if (this.given() || this.player.isPlaying()) {
      return;
    }
    this.given.set(direction);
    if (direction !== this.round().answer) {
      this.mistake.emit();
    }
    this.solved.emit();
  }
}
