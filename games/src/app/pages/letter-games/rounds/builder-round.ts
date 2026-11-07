import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { checkWord, LetterSet, lettersOf, WordCheck } from '../../../games/letter-games';
import { SiteLanguage } from '../../../i18n/site-language';
import { roundFeedback } from './round-feedback';

/**
 * Word builder: the player taps letters to make a word and checks it. Every word to find shows as empty boxes,
 * longest first, and fills in once found.
 */
@Component({
  selector: 'app-builder-round',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './builder-round.html',
  styleUrl: './letter-round.scss',
})
export class BuilderRound {
  readonly set = input.required<LetterSet>();
  /** With the timer on, time ran out: show every word and stop taking new ones */
  readonly isTimeUp = input(false);
  readonly newLetters = output<void>();
  /** Every word was found */
  readonly allFound = output<void>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly feedback = roundFeedback();

  protected readonly tiles = computed(() => this.set().letters.map((letter, id) => ({ id, letter })));
  /** Ids of the tiles in the word being made */
  protected readonly picked = linkedSignal({ source: this.set, computation: (): readonly number[] => [] });
  protected readonly found = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  protected readonly lastCheck = signal<WordCheck | null>(null);

  protected readonly word = computed(() =>
    this.picked()
      .map((id) => this.set().letters[id])
      .join(''),
  );
  protected readonly answers = computed(() =>
    this.set().answers.map((answer) => ({
      answer,
      isFound: this.found().includes(answer),
      isShown: this.found().includes(answer) || this.isTimeUp(),
      letters: lettersOf(answer),
    })),
  );
  protected readonly isAllFound = computed(() => this.found().length === this.set().answers.length);

  protected pick(id: number): void {
    if (!this.picked().includes(id)) {
      this.picked.update((picked) => [...picked, id]);
      this.lastCheck.set(null);
    }
  }

  protected deleteLast(): void {
    this.picked.update((picked) => picked.slice(0, -1));
    this.lastCheck.set(null);
  }

  protected check(): void {
    const word = this.word();
    const result = checkWord(word, this.set(), this.found());
    this.lastCheck.set(result);
    if (result === 'found') {
      this.found.update((found) => [...found, word]);
      if (this.isAllFound()) {
        this.allFound.emit();
      }
    }
    if (result === 'too-short') {
      this.feedback.wrong();
    } else if (result === 'unknown') {
      this.feedback.wrong(() => this.picked.set([]));
    } else {
      this.picked.set([]);
    }
  }
}
