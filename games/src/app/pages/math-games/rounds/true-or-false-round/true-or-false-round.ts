import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { formatQuestion, formatSolution, isTrue, Question } from '../../../../games/math-games';
import { SiteLanguage } from '../../../../i18n/site-language';
import { answerFlash } from '../../../../shared/answer-flash';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { RoundResult } from '../round-result';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

const ANSWER_KEYS: Readonly<Record<string, boolean>> = { ArrowLeft: false, ArrowRight: true };

@Component({
  selector: 'app-true-or-false-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './true-or-false-round.html',
  styleUrl: '../round.scss',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class TrueOrFalseRound {
  readonly question = input.required<Question>();
  readonly answering = output<void>();
  readonly answered = output<RoundResult>();

  protected readonly t = inject(SiteLanguage).messages;

  protected readonly equation = computed(() => formatQuestion(this.question()));
  protected readonly solution = computed(() => formatSolution(this.question()));
  protected readonly flash = answerFlash();

  protected answer(saysTrue: boolean): void {
    if (this.flash.isShowing()) {
      return;
    }
    const result: RoundResult = {
      isCorrect: saysTrue === isTrue(this.question()),
      given: this.t().trueOrFalse.given(saysTrue),
    };
    this.answering.emit();
    this.flash.show(result.isCorrect, () => this.answered.emit(result));
  }

  protected onKey(event: KeyboardEvent): void {
    const saysTrue = ANSWER_KEYS[event.key];
    if (saysTrue !== undefined) {
      event.preventDefault();
      this.answer(saysTrue);
    }
  }
}
