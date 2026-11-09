import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { DictionaryStatus } from '../../../core/word-dictionaries';
import { checkWord, LetterSet, lettersOf, targetWords, WordCheck } from '../../../games/letter-games';
import { SiteLanguage } from '../../../i18n/site-language';
import { roundFeedback } from '../../../shared/round-feedback';
import { typedKey } from '../../../shared/typed-letter';

/**
 * Word builder: the player taps letters to make a word and checks it. Every word to find shows as empty boxes,
 * longest first, and fills in once found: the checked word bank's words and, once the language's dictionary has
 * downloaded, its common words the letters make. Any other real word the player makes counts too and joins the list.
 * "Show the words" reveals the ones still missing.
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
  /** The language's dictionary, once downloaded, its most common words, and how its download is doing */
  readonly dictionary = input<ReadonlySet<string>>();
  readonly commonWords = input<readonly string[]>([]);
  readonly dictionaryStatus = input<DictionaryStatus>();
  readonly newLetters = output<void>();
  /** Every word was found */
  readonly allFound = output<void>();
  /** The player reported a word from the dictionary as rude */
  readonly reported = output<string>();
  /** A word was found (a room round scores each one) */
  readonly wordFound = output<string>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly feedback = roundFeedback();

  protected readonly tiles = computed(() => this.set().letters.map((letter, id) => ({ id, letter })));
  /** Ids of the tiles in the word being made */
  protected readonly picked = linkedSignal({ source: this.set, computation: (): readonly number[] => [] });
  protected readonly found = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  /** Real words the player made that weren't asked for; they join the list */
  private readonly extras = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  /** Words the player reported, taken off the list */
  private readonly removed = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  /** The player asked to see the words still missing */
  private readonly gaveUp = linkedSignal({ source: this.set, computation: () => false });
  /** A word was reported with these letters: thank the player */
  protected readonly hasReported = linkedSignal({ source: this.set, computation: () => false });
  protected readonly lastCheck = signal<WordCheck | null>(null);

  protected readonly word = computed(() =>
    this.picked()
      .map((id) => this.set().letters[id])
      .join(''),
  );
  /** Every word to find: the word bank's, common dictionary words, and real words the player added; longest first */
  private readonly targets = computed(() =>
    [...targetWords(this.set(), this.commonWords()), ...this.extras()]
      .filter((word) => !this.removed().includes(word))
      .sort((first, second) => lettersOf(second).length - lettersOf(first).length || first.localeCompare(second)),
  );
  protected readonly isRevealed = computed(() => this.isTimeUp() || this.gaveUp());
  protected readonly answers = computed(() =>
    this.targets().map((answer) => {
      const isFound = this.found().includes(answer);
      return {
        answer,
        isFound,
        isShown: isFound || this.isRevealed(),
        /** Words from the dictionary rather than the checked word bank can be reported */
        canReport: !this.set().answers.includes(answer),
        letters: lettersOf(answer),
      };
    }),
  );
  protected readonly foundCount = computed(() => this.answers().filter(({ isFound }) => isFound).length);
  protected readonly isAllFound = computed(() => this.foundCount() === this.answers().length);

  /** Shows the words still missing and ends these letters */
  protected showWords(): void {
    this.gaveUp.set(true);
    this.picked.set([]);
  }

  /** Takes a reported word off the list; the page sends the report */
  protected report(word: string): void {
    this.removed.update((removed) => [...removed, word]);
    this.found.update((found) => found.filter((foundWord) => foundWord !== word));
    this.hasReported.set(true);
    this.reported.emit(word);
  }

  /** Typing picks letters, Backspace deletes the last one and Enter checks the word */
  protected onKey(event: KeyboardEvent): void {
    const key = typedKey(event);
    if (!key || this.isRevealed() || this.isAllFound()) {
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
    const result = checkWord(word, this.set(), this.targets(), this.found(), this.dictionary());
    this.lastCheck.set(result);
    if (result === 'found') {
      if (!this.targets().includes(word)) {
        this.extras.update((extras) => [...extras, word]);
      }
      this.found.update((found) => [...found, word]);
      this.wordFound.emit(word);
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
