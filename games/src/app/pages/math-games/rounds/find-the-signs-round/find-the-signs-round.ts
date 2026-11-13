import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { evaluate, formatSigns, SignsPuzzle, solves } from '../../../../games/find-the-signs';
import { Operator } from '../../../../games/math-games';
import { SiteLanguage } from '../../../../i18n/site-language';
import { answerFlash } from '../../../../shared/answer-flash';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { RoundResult } from '../round-result';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

const SIGN_KEYS: Readonly<Record<string, Operator>> = { '+': '+', '-': '−', '*': '×', x: '×', '/': '÷', ':': '÷' };

@Component({
  selector: 'app-find-the-signs-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-the-signs-round.html',
  styleUrls: ['../round.scss', './find-the-signs-round.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class FindTheSignsRound {
  readonly puzzle = input.required<SignsPuzzle>();
  readonly operators = input.required<readonly Operator[]>();
  readonly answering = output<void>();
  readonly answered = output<RoundResult>();

  protected readonly t = inject(SiteLanguage).messages;

  protected readonly signs = linkedSignal<SignsPuzzle, readonly (Operator | null)[]>({
    source: this.puzzle,
    computation: (puzzle) => puzzle.operators.map(() => null),
  });
  protected readonly selected = linkedSignal({ source: this.puzzle, computation: () => 0 });
  protected readonly showHint = linkedSignal({ source: this.puzzle, computation: () => false });

  protected readonly flash = answerFlash();
  protected readonly solution = computed(() => {
    const { numbers, operators, result } = this.puzzle();
    return formatSigns(numbers, operators, result);
  });

  protected readonly isComplete = computed(() => this.signs().every((sign) => sign !== null));
  protected readonly hasPrecedence = computed(() =>
    this.operators().some((operator) => operator === '×' || operator === '÷'),
  );

  protected select(gap: number): void {
    if (this.flash.isShowing()) {
      return;
    }
    this.selected.set(gap);
  }

  protected choose(operator: Operator): void {
    if (this.flash.isShowing()) {
      return;
    }
    const signs = this.signs().map((sign, gap) => (gap === this.selected() ? operator : sign));
    this.signs.set(signs);
    this.showHint.set(false);
    const nextEmpty = signs.findIndex((sign) => sign === null);
    if (nextEmpty !== -1) {
      this.selected.set(nextEmpty);
    }
  }

  protected erase(): void {
    if (this.flash.isShowing()) {
      return;
    }
    this.signs.update((signs) => signs.map((sign, gap) => (gap === this.selected() ? null : sign)));
  }

  protected check(): void {
    if (this.flash.isShowing()) {
      return;
    }
    const signs = this.signs().filter((sign) => sign !== null);
    if (signs.length !== this.signs().length) {
      this.showHint.set(true);
      return;
    }
    const { numbers } = this.puzzle();
    const value = evaluate(numbers, signs);
    const result: RoundResult = {
      isCorrect: solves(this.puzzle(), signs),
      given: formatSigns(numbers, signs, value ?? this.t().findTheSigns.notWholeNumber),
    };
    this.answering.emit();
    this.flash.show(result.isCorrect, () => this.answered.emit(result));
  }

  protected onKey(event: KeyboardEvent): void {
    const operator = SIGN_KEYS[event.key];
    const lastGap = this.signs().length - 1;
    if (operator && this.operators().includes(operator)) {
      this.choose(operator);
    } else if (event.key === 'Backspace') {
      this.erase();
    } else if (event.key === 'Enter') {
      this.check();
    } else if (event.key === 'ArrowLeft') {
      this.selected.update((gap) => Math.max(0, gap - 1));
    } else if (event.key === 'ArrowRight') {
      this.selected.update((gap) => Math.min(lastGap, gap + 1));
    } else {
      return;
    }
    event.preventDefault();
  }
}
