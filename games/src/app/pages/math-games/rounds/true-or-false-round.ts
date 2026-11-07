import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { formatQuestion, isTrue, Question } from '../../../games/math-games';
import { GameLanguage } from '../i18n/game-language';
import { RoundResult } from './round-result';

/** Arrow keys answer too, so the round also works with a keyboard in every language */
const ANSWER_KEYS: Readonly<Record<string, boolean>> = { ArrowLeft: false, ArrowRight: true };

/** Shows a full equation; the player taps whether its result is true or false */
@Component({
  selector: 'app-true-or-false-round',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './true-or-false-round.html',
  styleUrl: './round.scss',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class TrueOrFalseRound {
  readonly question = input.required<Question>();
  readonly answered = output<RoundResult>();

  /** Texts in the game's language */
  protected readonly t = inject(GameLanguage).messages;

  protected readonly equation = computed(() => formatQuestion(this.question()));

  protected answer(saysTrue: boolean): void {
    this.answered.emit({
      isCorrect: saysTrue === isTrue(this.question()),
      given: this.t().trueOrFalse.given(saysTrue),
    });
  }

  protected onKey(event: KeyboardEvent): void {
    const saysTrue = ANSWER_KEYS[event.key];
    if (saysTrue !== undefined) {
      event.preventDefault();
      this.answer(saysTrue);
    }
  }
}
