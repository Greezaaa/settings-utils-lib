import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { GapWord, hintAfter, lettersOf } from '../../../../games/letter-games';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { roundFeedback } from '../../../../shared/round-feedback';
import { typedKey } from '../../../../shared/typed-letter';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

/**
 * A picture and its word with letters missing (the first vowel, or every vowel); the player taps the vowels to
 * fill the gaps in order. Used by First vowel and Missing vowels. With hints on, mistakes light up the right vowel.
 */
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
  /** Emitted as soon as the word is right; the word stays shown, finished, until the next one */
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly feedback = roundFeedback();

  protected readonly letters = computed(() => lettersOf(this.word().picture.word));
  /** How many gaps are filled; starts again with each word */
  private readonly filled = linkedSignal({ source: this.word, computation: () => 0 });
  protected readonly nextGap = computed(() => this.word().gaps[this.filled()] ?? null);
  protected readonly isDone = computed(() => this.nextGap() === null);
  /** The last try was wrong; cleared by the next right one and with each new word */
  private readonly missed = linkedSignal({ source: this.word, computation: () => false });
  /** For the answer line: right once done, wrong after a miss, nothing in between */
  protected readonly result = computed(() => (this.isDone() ? true : this.missed() ? false : null));
  /** Mistakes on this word; zero again with each word */
  private readonly wordMistakes = linkedSignal({ source: this.word, computation: () => 0 });
  /** With hints on, after a few mistakes the right vowel lights up */
  protected readonly hintVowel = computed(() => {
    const gap = this.nextGap();
    const showNext = this.hints() && hintAfter(this.wordMistakes(), this.letters().length).showNext;
    return showNext && gap !== null ? this.letters()[gap] : null;
  });

  protected isShown(index: number): boolean {
    const gap = this.word().gaps.indexOf(index);
    return gap === -1 || gap < this.filled();
  }

  /** Typing a vowel fills the next gap, like tapping it */
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
