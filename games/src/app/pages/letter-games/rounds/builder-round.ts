import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { DictionaryStatus } from '../../../core/word-dictionaries';
import { checkWord, LetterSet, lettersOf, WordCheck } from '../../../games/letter-games';
import { SiteLanguage } from '../../../i18n/site-language';
import { roundFeedback } from '../../../shared/round-feedback';
import { typedKey } from '../../../shared/typed-letter';

/**
 * Word builder: the player taps letters to make a word and checks it. Every word to find shows as empty boxes,
 * longest first, and fills in once found. Other real words, checked with the language's dictionary once it has
 * downloaded, count as bonus words.
 */
@Component({
  selector: 'app-builder-round',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './builder-round.html',
  styleUrls: ['./letter-round.scss', './builder-round.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class BuilderRound {
  readonly set = input.required<LetterSet>();
  /** With the timer on, time ran out: show every word and stop taking new ones */
  readonly isTimeUp = input(false);
  /** The language's dictionary, once downloaded, and how its download is doing */
  readonly dictionary = input<ReadonlySet<string>>();
  readonly dictionaryStatus = input<DictionaryStatus>();
  readonly newLetters = output<void>();
  /** Every word was found */
  readonly allFound = output<void>();
  /** The player reported a bonus word as rude */
  readonly reported = output<string>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly feedback = roundFeedback();

  protected readonly tiles = computed(() => this.set().letters.map((letter, id) => ({ id, letter })));
  /** Ids of the tiles in the word being made */
  protected readonly picked = linkedSignal({ source: this.set, computation: (): readonly number[] => [] });
  protected readonly found = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  protected readonly bonus = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  /** A word was reported with these letters: thank the player */
  protected readonly hasReported = linkedSignal({ source: this.set, computation: () => false });
  protected readonly bonusWords = computed(() => this.bonus().map((word) => ({ word, letters: lettersOf(word) })));
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

  /** Takes a reported word off the bonus words; the page sends the report */
  protected report(word: string): void {
    this.bonus.update((bonus) => bonus.filter((bonusWord) => bonusWord !== word));
    this.hasReported.set(true);
    this.reported.emit(word);
  }

  /** Typing picks letters, Backspace deletes the last one and Enter checks the word */
  protected onKey(event: KeyboardEvent): void {
    const key = typedKey(event);
    if (!key || this.isTimeUp() || this.isAllFound()) {
      return;
    }
    if (key.kind === 'letter') {
      const tile = this.tiles().find(
        (candidate) => candidate.letter === key.letter && !this.picked().includes(candidate.id),
      );
      if (tile) {
        event.preventDefault();
        this.pick(tile.id);
      }
    } else if (key.kind === 'delete' && this.picked().length > 0) {
      event.preventDefault();
      this.deleteLast();
    } else if (key.kind === 'enter' && this.picked().length > 0) {
      event.preventDefault();
      this.check();
    }
  }

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
    const result = checkWord(word, this.set(), [...this.found(), ...this.bonus()], this.dictionary());
    this.lastCheck.set(result);
    if (result === 'bonus') {
      this.bonus.update((bonus) => [...bonus, word]);
    }
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
