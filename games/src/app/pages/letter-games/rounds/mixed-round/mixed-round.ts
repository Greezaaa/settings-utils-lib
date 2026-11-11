import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { Hint, hintAfter, lettersOf, mixLetters } from '../../../../games/letter-games';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { roundFeedback } from '../../../../shared/round-feedback';
import { typedKey } from '../../../../shared/typed-letter';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

/** A tile of mixed letters; the id tells apart tiles with the same letter */
interface Tile {
  readonly id: number;
  readonly letter: string;
}

/** No help: hints are off, or there have not been enough mistakes yet */
const NO_HINT: Hint = { showNext: false, revealed: 0 };

/**
 * The letters of a word, mixed; the player taps them in order to spell it. Tapping a placed letter takes it back.
 * With hints on, mistakes on the word light up the next letter, then place the first letters (see `hintAfter`).
 */
@Component({
  selector: 'app-mixed-round',
  imports: [TranslatePipe, AnswerLine],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mixed-round.html',
  styleUrl: '../letter-round.scss',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class MixedRound {
  readonly word = input.required<string>();
  readonly hints = input(true);
  /** Emitted as soon as the word is right; the word stays shown, finished, until the next one */
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly feedback = roundFeedback();

  protected readonly tiles = computed<readonly Tile[]>(() =>
    mixLetters(this.word(), Math.random).map((letter, id) => ({ id, letter })),
  );
  /** Tiles placed in the answer, in order; empty again with each word */
  protected readonly placed = linkedSignal({ source: this.tiles, computation: (): readonly Tile[] => [] });
  /** Mistakes on this word; zero again with each word */
  private readonly wordMistakes = linkedSignal({ source: this.tiles, computation: () => 0 });
  protected readonly hint = computed(() =>
    this.hints() ? hintAfter(this.wordMistakes(), this.tiles().length) : NO_HINT,
  );
  /** The tile to light up: the next right letter, while every placed letter is right so far */
  protected readonly nextTile = computed(() => {
    const placed = this.placed();
    const letters = lettersOf(this.word());
    const isRightSoFar = placed.every((tile, index) => tile.letter === letters[index]);
    if (!this.hint().showNext || !isRightSoFar) {
      return null;
    }
    return this.tiles().find((tile) => !placed.includes(tile) && tile.letter === letters[placed.length]) ?? null;
  });

  /** One box per letter of the word, holding the placed tile or nothing */
  protected readonly slots = computed(() => this.tiles().map((_, index) => this.placed()[index] ?? null));
  protected readonly isDone = computed(
    () =>
      this.placed()
        .map(({ letter }) => letter)
        .join('') === this.word(),
  );

  /** The last try was wrong; cleared by the next right one and with each new word */
  private readonly missed = linkedSignal({ source: this.tiles, computation: () => false });
  /** For the answer line: right once done, wrong after a miss, nothing in between */
  protected readonly result = computed(() => (this.isDone() ? true : this.missed() ? false : null));

  protected isPlaced(tile: Tile): boolean {
    return this.placed().includes(tile);
  }

  /** Typing a letter places the first tile with it; Backspace takes back the last placed letter */
  protected onKey(event: KeyboardEvent): void {
    const key = typedKey(event);
    if (key?.kind === 'letter') {
      const tile = this.tiles().find((candidate) => candidate.letter === key.letter && !this.isPlaced(candidate));
      if (tile) {
        event.preventDefault();
        this.place(tile);
      }
    } else if (key?.kind === 'delete') {
      const last = this.placed().at(-1);
      if (last) {
        event.preventDefault();
        this.takeBack(last);
      }
    }
  }

  protected place(tile: Tile): void {
    if (this.isPlaced(tile) || this.isDone() || this.feedback.isWrong()) {
      return;
    }
    this.missed.set(false);
    this.placed.update((placed) => [...placed, tile]);
    if (this.placed().length < this.tiles().length) {
      return;
    }
    if (this.isDone()) {
      this.solved.emit();
    } else {
      this.mistake.emit();
      this.wordMistakes.update((mistakes) => mistakes + 1);
      this.missed.set(true);
      this.feedback.wrong(() => this.placed.set(this.firstLetters(this.hint().revealed)));
    }
  }

  /** Whether a placed letter was placed by a hint, so it stays */
  protected isRevealed(index: number): boolean {
    return index < this.hint().revealed;
  }

  protected takeBack(tile: Tile): void {
    if (!this.isDone() && !this.feedback.isWrong() && !this.isRevealed(this.placed().indexOf(tile))) {
      this.placed.update((placed) => placed.filter((placedTile) => placedTile !== tile));
    }
  }

  /** Tiles that spell the first `count` letters of the word */
  private firstLetters(count: number): Tile[] {
    const chosen: Tile[] = [];
    for (const letter of lettersOf(this.word()).slice(0, count)) {
      const tile = this.tiles().find((candidate) => candidate.letter === letter && !chosen.includes(candidate));
      if (tile) {
        chosen.push(tile);
      }
    }
    return chosen;
  }
}
