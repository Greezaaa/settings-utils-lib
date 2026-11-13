import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { BOX_SHAPES, boxCells, dealSudoku, DEFAULT_SUDOKU_SIZE, isSolved, repeatedCells, SudokuBoard, SudokuPuzzle, SudokuSize, SUDOKU_SIZES } from '../../games/letter-sudoku';
import { GameBoard } from '../../shared/game-board';
import { GameClock } from '../../shared/game-clock';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'playing' | 'done';

/** Where a press started: a letter in the tray, or a cell of the board */
type PressSource = { readonly kind: 'tray'; readonly letter: number } | { readonly kind: 'cell'; readonly cell: number };

/** A press on a letter or a cell, which becomes a drag once the pointer moves far enough */
interface Press {
  readonly source: PressSource;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
}

/** Pointer movement, in pixels, below which a press counts as a tap rather than a drag */
const DRAG_THRESHOLD = 8;

const NO_CELLS: ReadonlySet<number> = new Set();

/**
 * Letter sudoku: a classic sudoku where each letter goes once in every row, column and box. Letters are dragged from
 * the tray onto the empty cells, from one cell to another, or off the board to take them back; tapping a letter and
 * then a cell does the same, also with the keyboard. Check marks the letters repeated in a row, column or box.
 */
@Component({
  selector: 'app-letter-sudoku-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './letter-sudoku-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
    '../../shared/play-layout.scss',
    './letter-sudoku-page.scss',
  ],
})
export class LetterSudokuPage {
  protected readonly sizes = SUDOKU_SIZES;
  protected readonly minAge = gameInfo('letter-sudoku').minAge;
  private readonly api = inject(GamesApi);
  private readonly messages = inject(SiteLanguage).messages;
  protected readonly clock = new GameClock();

  protected readonly size = signal<SudokuSize>(DEFAULT_SUDOKU_SIZE);
  protected readonly phase = signal<Phase>('playing');
  private readonly puzzle = signal<SudokuPuzzle | null>(null);
  protected readonly board = signal<SudokuBoard>([]);
  protected readonly boxShape = computed(() => BOX_SHAPES[this.size()]);
  /** The board's cells, box by box; none until a puzzle is dealt in the browser */
  protected readonly boxes = computed(() => (this.puzzle() ? boxCells(this.size()) : []));
  /** The letters of the tray, as indexes, in alphabet order */
  protected readonly trayLetters = computed(() => Array.from({ length: this.size() }, (_, letter) => letter));
  /** Letters already on the board as many times as there are rows */
  protected readonly usedUp = computed(() => {
    const board = this.board();
    return new Set(this.trayLetters().filter((letter) => board.filter((cell) => cell === letter).length >= this.size()));
  });

  /** A tray letter chosen by a tap, placed on each cell tapped next */
  protected readonly picked = signal<number | null>(null);
  /** Check was pressed since the last move: the repeated letters are marked */
  protected readonly isChecked = signal(false);
  protected readonly repeated = computed(() =>
    this.isChecked() ? repeatedCells(this.board(), this.size()) : NO_CELLS,
  );

  protected readonly press = signal<Press | null>(null);
  /** The letter being dragged and where to draw it, once the press has moved far enough */
  protected readonly dragged = computed(() => {
    const press = this.press();
    const letter = press && this.movableLetter(press.source);
    return press && letter !== null && isDrag(press) ? { letter, x: press.x, y: press.y } : null;
  });

  private hasStarted = false;

  constructor() {
    // Dealt in the browser only, so the prerendered page doesn't show one board and then another
    afterNextRender(() => this.newGame());
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

  /** A letter's character in the site's language, e.g. 0 → `A` */
  protected letterOf(letter: number | null): string {
    return letter === null ? '' : this.messages().letterSudoku.letters[letter];
  }

  protected isGiven(cell: number): boolean {
    return this.puzzle()?.start[cell] !== null;
  }

  protected cellSource(cell: number): PressSource {
    return { kind: 'cell', cell };
  }

  protected traySource(letter: number): PressSource {
    return { kind: 'tray', letter };
  }

  /** The cell whose letter is being dragged away */
  protected isLifted(cell: number): boolean {
    const source = this.press()?.source;
    return this.dragged() !== null && source?.kind === 'cell' && source.cell === cell;
  }

  /** A cell's row and column, counted from 1, for screen readers */
  protected rowOf(cell: number): number {
    return Math.floor(cell / this.size()) + 1;
  }

  protected columnOf(cell: number): number {
    return (cell % this.size()) + 1;
  }

  protected chooseSize(size: SudokuSize): void {
    this.size.set(size);
    this.newGame();
  }

  protected newGame(): void {
    this.clock.reset();
    this.hasStarted = false;
    const puzzle = dealSudoku(this.size(), Math.random);
    this.puzzle.set(puzzle);
    this.board.set(puzzle.start);
    this.picked.set(null);
    this.press.set(null);
    this.isChecked.set(false);
    this.phase.set('playing');
  }

  protected check(): void {
    this.isChecked.set(true);
  }

  protected onPointerDown(event: PointerEvent, source: PressSource): void {
    if (this.phase() !== 'playing' || !event.isPrimary) {
      return;
    }
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const [x, y] = [event.clientX, event.clientY];
    this.press.set({ source, pointerId: event.pointerId, startX: x, startY: y, x, y });
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.press();
    if (press?.pointerId === event.pointerId) {
      this.press.set({ ...press, x: event.clientX, y: event.clientY });
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    const press = this.press();
    if (press?.pointerId !== event.pointerId) {
      return;
    }
    const dragged = this.dragged();
    this.press.set(null);
    if (!isDrag(press)) {
      this.tap(press.source);
    } else if (dragged) {
      this.drop(press.source, dragged.letter, this.cellAt(event.clientX, event.clientY));
    }
  }

  protected cancelPress(): void {
    this.press.set(null);
  }

  /** Keyboard (Enter or Space) works like a tap; pointer taps are handled on pointer up */
  protected onClick(event: MouseEvent, source: PressSource): void {
    if (event.detail === 0 && this.phase() === 'playing') {
      this.tap(source);
    }
  }

  /**
   * A tap on a tray letter picks it (or drops it, when picked already). A tap on a cell places the picked letter, or
   * empties it when it holds that letter already or nothing is picked.
   */
  private tap(source: PressSource): void {
    if (source.kind === 'tray') {
      this.picked.update((picked) => (picked === source.letter ? null : source.letter));
      return;
    }
    const picked = this.picked();
    this.setCell(source.cell, picked === this.board()[source.cell] ? null : picked);
  }

  /** A dragged letter lands on a cell, leaving the one it came from; dragged off the board, it goes back */
  private drop(source: PressSource, letter: number, target: number | null): void {
    if (source.kind === 'cell' && source.cell !== target) {
      this.setCell(source.cell, null);
    }
    if (target !== null) {
      this.setCell(target, letter);
    }
  }

  /** The letter a press can drag: any tray letter, or a letter the player put on the board */
  private movableLetter(source: PressSource): number | null {
    if (source.kind === 'tray') {
      return source.letter;
    }
    return this.isGiven(source.cell) ? null : this.board()[source.cell];
  }

  /** Puts a letter on a cell (null empties it), unless its letter was given; the board may now be solved */
  private setCell(cell: number, letter: number | null): void {
    if (this.isGiven(cell) || this.board()[cell] === letter) {
      return;
    }
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.api.countPlay('letter-sudoku');
      this.clock.start();
    }
    this.board.update((board) => board.map((current, index) => (index === cell ? letter : current)));
    this.isChecked.set(false);
    if (isSolved(this.board(), this.size())) {
      this.clock.stop();
      this.picked.set(null);
      this.phase.set('done');
    }
  }

  /** The board cell under a point */
  private cellAt(x: number, y: number): number | null {
    const tile = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]');
    const cell = Number(tile?.dataset['cell']);
    return tile && Number.isInteger(cell) ? cell : null;
  }
}

const isDrag = ({ startX, startY, x, y }: Press): boolean => Math.hypot(x - startX, y - startY) >= DRAG_THRESHOLD;
