import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { formatPrompt, formatSolution, isCorrectAnswer, Question } from '../../../../games/math-games';
import { answerFlash } from '../../../../shared/answer-flash';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { RoundResult } from '../round-result';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

const MAX_DIGITS = 5;

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

@Component({
  selector: 'app-your-answer-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './your-answer-round.html',
  styleUrls: ['../round.scss', './your-answer-round.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class YourAnswerRound {
  readonly question = input.required<Question>();
  readonly answering = output<void>();
  readonly answered = output<RoundResult>();


  protected readonly digits = DIGITS;
  protected readonly prompt = computed(() => formatPrompt(this.question()));
  protected readonly solution = computed(() => formatSolution(this.question()));
  protected readonly flash = answerFlash();

  protected readonly typed = linkedSignal({ source: this.question, computation: () => '' });
  protected readonly showHint = linkedSignal({ source: this.question, computation: () => false });

  protected press(digit: string): void {
    if (this.typed().length < MAX_DIGITS && !this.flash.isShowing()) {
      this.typed.update((typed) => typed + digit);
      this.showHint.set(false);
    }
  }

  protected erase(): void {
    if (this.flash.isShowing()) {
      return;
    }
    this.typed.update((typed) => typed.slice(0, -1));
  }

  protected check(): void {
    if (this.flash.isShowing()) {
      return;
    }
    if (!this.typed()) {
      this.showHint.set(true);
      return;
    }
    const result: RoundResult = { isCorrect: isCorrectAnswer(this.question(), this.typed()), given: this.typed() };
    this.answering.emit();
    this.flash.show(result.isCorrect, () => this.answered.emit(result));
  }

  protected onKey(event: KeyboardEvent): void {
    if (/^\d$/.test(event.key)) {
      this.press(event.key);
    } else if (event.key === 'Backspace') {
      this.erase();
    } else if (event.key === 'Enter') {
      this.check();
    } else {
      return;
    }
    event.preventDefault();
  }
}
