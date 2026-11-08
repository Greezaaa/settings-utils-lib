import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { evaluate, formatSigns, SignsPuzzle, solves } from '../../../games/find-the-signs';
import { Operator } from '../../../games/math-games';
import { SiteLanguage } from '../../../i18n/site-language';
import { answerFlash } from '../../../shared/answer-flash';
import { AnswerLine } from '../../../shared/answer-line';
import { RoundResult } from './round-result';

/** Keyboard keys for each sign, so the round also works with a keyboard */
const SIGN_KEYS: Readonly<Record<string, Operator>> = { '+': '+', '-': '−', '*': '×', x: '×', '/': '÷', ':': '÷' };

/** Shows an equation with its signs missing; the player taps a sign for each gap, then checks */
@Component({
  selector: 'app-find-the-signs-round',
  imports: [AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './find-the-signs-round.html',
  styleUrls: ['./round.scss', './find-the-signs-round.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class FindTheSignsRound {
  readonly puzzle = input.required<SignsPuzzle>();
  /** Signs the level uses, shown as buttons */
  readonly operators = input.required<readonly Operator[]>();
  readonly answering = output<void>();
  readonly answered = output<RoundResult>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  /** The player's sign for each gap, `null` while empty; cleared for every new puzzle */
  protected readonly signs = linkedSignal<SignsPuzzle, readonly (Operator | null)[]>({
    source: this.puzzle,
    computation: (puzzle) => puzzle.operators.map(() => null),
  });
  /** The gap the next sign goes into */
  protected readonly selected = linkedSignal({ source: this.puzzle, computation: () => 0 });
  protected readonly showHint = linkedSignal({ source: this.puzzle, computation: () => false });

  protected readonly flash = answerFlash();
  /** The equation with the puzzle's own signs */
  protected readonly solution = computed(() => {
    const { numbers, operators, result } = this.puzzle();
    return formatSigns(numbers, operators, result);
  });

  protected readonly isComplete = computed(() => this.signs().every((sign) => sign !== null));
  /** Whether the order of signs matters, so the hint about × and ÷ is worth showing */
  protected readonly hasPrecedence = computed(() =>
    this.operators().some((operator) => operator === '×' || operator === '÷'),
  );

  protected select(gap: number): void {
    if (this.flash.isShowing()) {
      return;
    }
    this.selected.set(gap);
  }

  /** Puts a sign in the selected gap, then moves on to the next empty one */
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
    // Show what the player's signs actually make, e.g. `4 × 5 − 5 = 15`
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
