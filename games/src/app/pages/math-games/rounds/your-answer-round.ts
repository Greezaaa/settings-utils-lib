import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { formatPrompt, isCorrectAnswer, Question } from '../../../games/math-games';
import { SiteLanguage } from '../../../i18n/site-language';
import { RoundResult } from './round-result';

/** Enough digits for the largest result of any level */
const MAX_DIGITS = 5;

/** Digits in the order of the pad: 1 to 9, then 0 between delete and check */
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/** Shows an equation without its result; the player taps the result on a number pad, made for tablets */
@Component({
  selector: 'app-your-answer-round',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './your-answer-round.html',
  styleUrls: ['./round.scss', './your-answer-round.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class YourAnswerRound {
  readonly question = input.required<Question>();
  readonly answered = output<RoundResult>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly digits = DIGITS;
  protected readonly prompt = computed(() => formatPrompt(this.question()));

  /** Digits tapped so far; cleared for every new question */
  protected readonly typed = linkedSignal({ source: this.question, computation: () => '' });
  /** Whether the player tried to check without a number */
  protected readonly showHint = linkedSignal({ source: this.question, computation: () => false });

  protected press(digit: string): void {
    if (this.typed().length < MAX_DIGITS) {
      this.typed.update((typed) => typed + digit);
      this.showHint.set(false);
    }
  }

  protected erase(): void {
    this.typed.update((typed) => typed.slice(0, -1));
  }

  protected check(): void {
    if (!this.typed()) {
      this.showHint.set(true);
      return;
    }
    this.answered.emit({ isCorrect: isCorrectAnswer(this.question(), this.typed()), given: this.typed() });
  }

  /** A physical keyboard works too: digits, Backspace and Enter */
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
