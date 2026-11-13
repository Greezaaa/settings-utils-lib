import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { DictionaryStatus } from '../../../../core/word-dictionaries';
import { checkWord, LetterSet, lettersOf, targetWords, WordCheck } from '../../../../games/letter-games';
import { roundFeedback } from '../../../../shared/round-feedback';
import { typedKey } from '../../../../shared/typed-letter';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

@Component({
  selector: 'app-builder-round',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './builder-round.html',
  styleUrls: ['../letter-round.scss', './builder-round.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class BuilderRound {
  readonly set = input.required<LetterSet>();
  readonly isTimeUp = input(false);
  readonly dictionary = input<ReadonlySet<string>>();
  readonly commonWords = input<readonly string[]>([]);
  readonly dictionaryStatus = input<DictionaryStatus>();
  readonly newLetters = output<void>();
  readonly allFound = output<void>();
  readonly reported = output<string>();
  readonly wordFound = output<string>();

  protected readonly feedback = roundFeedback();

  protected readonly tiles = computed(() => this.set().letters.map((letter, id) => ({ id, letter })));
  protected readonly picked = linkedSignal({ source: this.set, computation: (): readonly number[] => [] });
  protected readonly found = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  private readonly extras = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  private readonly removed = linkedSignal({ source: this.set, computation: (): readonly string[] => [] });
  private readonly gaveUp = linkedSignal({ source: this.set, computation: () => false });
  protected readonly hasReported = linkedSignal({ source: this.set, computation: () => false });
  protected readonly lastCheck = signal<WordCheck | null>(null);

  protected readonly word = computed(() =>
    this.picked()
      .map((id) => this.set().letters[id])
      .join(''),
  );
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
        canReport: !this.set().answers.includes(answer),
        letters: lettersOf(answer),
      };
    }),
  );
  protected readonly foundCount = computed(() => this.answers().filter(({ isFound }) => isFound).length);
  protected readonly isAllFound = computed(() => this.foundCount() === this.answers().length);

  protected showWords(): void {
    this.gaveUp.set(true);
    this.picked.set([]);
  }

  protected report(word: string): void {
    this.removed.update((removed) => [...removed, word]);
    this.found.update((found) => found.filter((foundWord) => foundWord !== word));
    this.hasReported.set(true);
    this.reported.emit(word);
  }

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
