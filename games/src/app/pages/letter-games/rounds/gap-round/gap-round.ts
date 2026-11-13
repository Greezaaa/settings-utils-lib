import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { GapWord, hintAfter, lettersOf } from '../../../../games/letter-games';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { roundFeedback } from '../../../../shared/round-feedback';
import { typedKey } from '../../../../shared/typed-letter';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

@Component({
  selector: 'app-gap-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gap-round.html',
  styleUrl: '../letter-round.scss',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class GapRound {
  readonly word = input.required<GapWord>();
  readonly vowels = input.required<readonly string[]>();
  readonly hints = input(true);
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly feedback = roundFeedback();

  protected readonly letters = computed(() => lettersOf(this.word().picture.word));
  private readonly filled = linkedSignal({ source: this.word, computation: () => 0 });
  protected readonly nextGap = computed(() => this.word().gaps[this.filled()] ?? null);
  protected readonly isDone = computed(() => this.nextGap() === null);
  private readonly missed = linkedSignal({ source: this.word, computation: () => false });
  protected readonly result = computed(() => (this.isDone() ? true : this.missed() ? false : null));
  private readonly wordMistakes = linkedSignal({ source: this.word, computation: () => 0 });
  protected readonly hintVowel = computed(() => {
    const gap = this.nextGap();
    const showNext = this.hints() && hintAfter(this.wordMistakes(), this.letters().length).showNext;
    return showNext && gap !== null ? this.letters()[gap] : null;
  });

  protected isShown(index: number): boolean {
    const gap = this.word().gaps.indexOf(index);
    return gap === -1 || gap < this.filled();
  }

  protected onKey(event: KeyboardEvent): void {
    const key = typedKey(event);
    if (key?.kind === 'letter' && this.vowels().includes(key.letter)) {
      event.preventDefault();
      this.tap(key.letter);
    }
  }

  protected tap(vowel: string): void {
    const gap = this.nextGap();
    if (gap === null || this.feedback.isWrong()) {
      return;
    }
    if (this.letters()[gap] !== vowel) {
      this.mistake.emit();
      this.wordMistakes.update((mistakes) => mistakes + 1);
      this.missed.set(true);
      this.feedback.wrong();
      return;
    }
    this.missed.set(false);
    this.filled.update((filled) => filled + 1);
    if (this.isDone()) {
      this.solved.emit();
    }
  }
}
