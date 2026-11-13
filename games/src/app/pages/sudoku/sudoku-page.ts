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

type PressSource = { readonly kind: 'tray'; readonly symbol: number } | { readonly kind: 'cell'; readonly cell: number };

interface Press {
  readonly source: PressSource;
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly x: number;
  readonly y: number;
}

const DRAG_THRESHOLD = 8;

const NO_CELLS: ReadonlySet<number> = new Set();

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
  protected readonly boxes = computed(() => (this.puzzle() ? boxCells(this.size()) : []));
  protected readonly traySymbols = computed(() => Array.from({ length: this.size() }, (_, symbol) => symbol));
  protected readonly usedUp = computed(() => {
    const board = this.board();
    return new Set(this.traySymbols().filter((symbol) => board.filter((cell) => cell === symbol).length >= this.size()));
  });

  protected readonly picked = signal<number | null>(null);
  protected readonly isChecked = signal(false);
  protected readonly repeated = computed(() =>
    this.isChecked() ? repeatedCells(this.board(), this.size()) : NO_CELLS,
  );

  protected readonly press = signal<Press | null>(null);
  protected readonly dragged = computed(() => {
    const press = this.press();
    const symbol = press && this.movableSymbol(press.source);
    return press && symbol !== null && isDrag(press) ? { symbol, x: press.x, y: press.y } : null;
  });

  private hasStarted = false;

  constructor() {
    afterNextRender(() => this.newGame());
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

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

  protected isLifted(cell: number): boolean {
    const source = this.press()?.source;
    return this.dragged() !== null && source?.kind === 'cell' && source.cell === cell;
  }

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

  protected onClick(event: MouseEvent, source: PressSource): void {
    if (event.detail === 0 && this.phase() === 'playing') {
      this.tap(source);
    }
  }

  private tap(source: PressSource): void {
    if (source.kind === 'tray') {
      this.picked.update((picked) => (picked === source.symbol ? null : source.symbol));
      return;
    }
    const picked = this.picked();
    this.setCell(source.cell, picked === this.board()[source.cell] ? null : picked);
  }

  private drop(source: PressSource, symbol: number, target: number | null): void {
    if (source.kind === 'cell' && source.cell !== target) {
      this.setCell(source.cell, null);
    }
    if (target !== null) {
      this.setCell(target, symbol);
    }
  }

  private movableSymbol(source: PressSource): number | null {
    if (source.kind === 'tray') {
      return source.symbol;
    }
    return this.isGiven(source.cell) ? null : this.board()[source.cell];
  }

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

  private cellAt(x: number, y: number): number | null {
    const tile = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]');
    const cell = Number(tile?.dataset['cell']);
    return tile && Number.isInteger(cell) ? cell : null;
  }
}

const isDrag = ({ startX, startY, x, y }: Press): boolean => Math.hypot(x - startX, y - startY) >= DRAG_THRESHOLD;
