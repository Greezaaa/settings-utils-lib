import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { Hint, hintAfter, lettersOf, mixLetters } from '../../../../games/letter-games';
import { AnswerLine } from '../../../../shared/answer-line/answer-line';
import { roundFeedback } from '../../../../shared/round-feedback';
import { typedKey } from '../../../../shared/typed-letter';
import { TranslatePipe } from '../../../../i18n/translate-pipe';

interface Tile {
  readonly id: number;
  readonly letter: string;
}

const NO_HINT: Hint = { showNext: false, revealed: 0 };

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
  readonly solved = output<void>();
  readonly mistake = output<void>();

  protected readonly feedback = roundFeedback();

  protected readonly tiles = computed<readonly Tile[]>(() =>
    mixLetters(this.word(), Math.random).map((letter, id) => ({ id, letter })),
  );
  protected readonly placed = linkedSignal({ source: this.tiles, computation: (): readonly Tile[] => [] });
  private readonly wordMistakes = linkedSignal({ source: this.tiles, computation: () => 0 });
  protected readonly hint = computed(() =>
    this.hints() ? hintAfter(this.wordMistakes(), this.tiles().length) : NO_HINT,
  );
  protected readonly nextTile = computed(() => {
    const placed = this.placed();
    const letters = lettersOf(this.word());
    const isRightSoFar = placed.every((tile, index) => tile.letter === letters[index]);
    if (!this.hint().showNext || !isRightSoFar) {
      return null;
    }
    return this.tiles().find((tile) => !placed.includes(tile) && tile.letter === letters[placed.length]) ?? null;
  });

  protected readonly slots = computed(() => this.tiles().map((_, index) => this.placed()[index] ?? null));
  protected readonly isDone = computed(
    () =>
      this.placed()
        .map(({ letter }) => letter)
        .join('') === this.word(),
  );

  private readonly missed = linkedSignal({ source: this.tiles, computation: () => false });
  protected readonly result = computed(() => (this.isDone() ? true : this.missed() ? false : null));

  protected isPlaced(tile: Tile): boolean {
    return this.placed().includes(tile);
  }

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

  protected isRevealed(index: number): boolean {
    return index < this.hint().revealed;
  }

  protected takeBack(tile: Tile): void {
    if (!this.isDone() && !this.feedback.isWrong() && !this.isRevealed(this.placed().indexOf(tile))) {
      this.placed.update((placed) => placed.filter((placedTile) => placedTile !== tile));
    }
  }

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
