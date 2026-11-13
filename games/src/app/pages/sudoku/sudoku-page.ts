import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { BOX_SHAPES, boxCells, dealSudoku, DEFAULT_SUDOKU_SIZE, isSolved, repeatedCells, SudokuBoard, SudokuGame, SudokuPuzzle, SudokuSize, SUDOKU_SIZES } from '../../games/sudoku';
import { GameBoard } from '../../shared/game-board';
import { GameClock } from '../../shared/game-clock';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { SiteLanguage } from '../../i18n/site-language';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'playing' | 'done';

/** Where a press started: a symbol in the tray, or a cell of the board */
type PressSource = { readonly kind: 'tray'; readonly symbol: number } | { readonly kind: 'cell'; readonly cell: number };

/** A press on a symbol or a cell, which becomes a drag once the pointer moves far enough */
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
 * The page of the sudoku games (symbol and number sudoku, given by the route as `game`): a classic sudoku where each
 * symbol goes once in every row, column and box. Symbols are dragged from the tray onto the empty cells, from one cell
 * to another, or off the board to take them back; tapping a symbol and then a cell does the same, also with the
 * keyboard. Check marks the symbols repeated in a row, column or box.
 */
@Component({
  selector: 'app-sudoku-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sudoku-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
    '../../shared/play-layout.scss',
    './sudoku-page.scss',
  ],
})
export class SudokuPage {
  /** Which sudoku game this page plays, from the route's data */
  readonly game = input.required<SudokuGame>();
  protected readonly sizes = SUDOKU_SIZES;
  protected readonly minAge = computed(() => gameInfo(this.game()).minAge);
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
  /** The symbols of the tray, as indexes, in order */
  protected readonly traySymbols = computed(() => Array.from({ length: this.size() }, (_, symbol) => symbol));
  /** Symbols already on the board as many times as there are rows */
  protected readonly usedUp = computed(() => {
    const board = this.board();
    return new Set(this.traySymbols().filter((symbol) => board.filter((cell) => cell === symbol).length >= this.size()));
  });

  /** A tray symbol chosen by a tap, placed on each cell tapped next */
  protected readonly picked = signal<number | null>(null);
  /** Check was pressed since the last move: the repeated symbols are marked */
  protected readonly isChecked = signal(false);
  protected readonly repeated = computed(() =>
    this.isChecked() ? repeatedCells(this.board(), this.size()) : NO_CELLS,
  );

  protected readonly press = signal<Press | null>(null);
  /** The symbol being dragged and where to draw it, once the press has moved far enough */
  protected readonly dragged = computed(() => {
    const press = this.press();
    const symbol = press && this.movableSymbol(press.source);
    return press && symbol !== null && isDrag(press) ? { symbol, x: press.x, y: press.y } : null;
  });

  private hasStarted = false;

  constructor() {
    // Dealt in the browser only, so the prerendered page doesn't show one board and then another
    afterNextRender(() => this.newGame());
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

  /** A symbol as shown, e.g. 0 → `A` in symbol sudoku (in the site's language) or `1` in number sudoku */
  protected symbolOf(symbol: number | null): string {
    return symbol === null ? '' : this.messages().sudoku.games[this.game()].symbols[symbol];
  }

  protected isGiven(cell: number): boolean {
    return this.puzzle()?.start[cell] !== null;
  }

  protected cellSource(cell: number): PressSource {
    return { kind: 'cell', cell };
  }

  protected traySource(symbol: number): PressSource {
    return { kind: 'tray', symbol };
  }

  /** The cell whose symbol is being dragged away */
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
      this.drop(press.source, dragged.symbol, this.cellAt(event.clientX, event.clientY));
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
   * A tap on a tray symbol picks it (or drops it, when picked already). A tap on a cell places the picked symbol, or
   * empties it when it holds that symbol already or nothing is picked.
   */
  private tap(source: PressSource): void {
    if (source.kind === 'tray') {
      this.picked.update((picked) => (picked === source.symbol ? null : source.symbol));
      return;
    }
    const picked = this.picked();
    this.setCell(source.cell, picked === this.board()[source.cell] ? null : picked);
  }

  /** A dragged symbol lands on a cell, leaving the one it came from; dragged off the board, it goes back */
  private drop(source: PressSource, symbol: number, target: number | null): void {
    if (source.kind === 'cell' && source.cell !== target) {
      this.setCell(source.cell, null);
    }
    if (target !== null) {
      this.setCell(target, symbol);
    }
  }

  /** The symbol a press can drag: any tray symbol, or a symbol the player put on the board */
  private movableSymbol(source: PressSource): number | null {
    if (source.kind === 'tray') {
      return source.symbol;
    }
    return this.isGiven(source.cell) ? null : this.board()[source.cell];
  }

  /** Puts a symbol on a cell (null empties it), unless its symbol was given; the board may now be solved */
  private setCell(cell: number, symbol: number | null): void {
    if (this.isGiven(cell) || this.board()[cell] === symbol) {
      return;
    }
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.api.countPlay(this.game());
      this.clock.start();
    }
    this.board.update((board) => board.map((current, index) => (index === cell ? symbol : current)));
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
