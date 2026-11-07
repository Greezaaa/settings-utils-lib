import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { readStored, writeStored } from '../../core/site-storage';
import { BoardLevelId } from '../../games/board';
import { canMove, cellForArrow, createPuzzle, Direction, getPuzzleLevel, isSolved, move, Puzzle, PUZZLE_LEVELS, tileNumber } from '../../games/sliding-puzzle';
import { SiteLanguage } from '../../i18n/site-language';
import { PuzzlePictureMode } from '../../i18n/site-messages';
import { GameBoard } from '../../shared/game-board';
import { PictureSlice } from '../../shared/picture-slice';
import { PuzzleTile } from './puzzle-tile';

/** A tile on the board: which piece it is and the cell it sits in now */
interface PlacedTile {
  readonly tile: number;
  readonly cell: number;
  readonly number: number;
  readonly canMove: boolean;
}

/** Fewest moves per level, saved in this browser */
const BEST_MOVES_STORAGE = 'sliding-puzzle:best-moves';
type BestMoves = Partial<Record<BoardLevelId, number>>;

const DEFAULT_LEVEL: BoardLevelId = 'normal';

const ARROWS: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left',
};

/**
 * Sliding puzzle: tap a tile next to the gap to slide it there, until the lines join into the picture.
 * Four board sizes, from 2 × 3 to 5 × 5, with tiles showing pieces of a line or of a drawing.
 * Counts moves and time, and remembers the fewest moves per size.
 */
@Component({
  selector: 'app-sliding-puzzle-page',
  imports: [GameBoard, PictureSlice, PuzzleTile, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sliding-puzzle-page.html',
  styleUrls: ['../../shared/utility-page.scss', './sliding-puzzle-page.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class SlidingPuzzlePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly levels = PUZZLE_LEVELS;
  protected readonly levelId = signal<BoardLevelId>(DEFAULT_LEVEL);
  protected readonly pictureModes: readonly PuzzlePictureMode[] = ['lines', 'drawing'];
  protected readonly pictureMode = signal<PuzzlePictureMode>('lines');
  /** The drawing the tiles show in drawing mode */
  protected readonly picture = signal<GamePicture | null>(null);

  /** Created in the browser only, so the prerendered page and the first render agree */
  protected readonly puzzle = signal<Puzzle | null>(null);
  protected readonly moves = signal(0);
  protected readonly seconds = signal(0);
  private readonly bestMovesByLevel = signal<BestMoves>({});
  protected readonly bestMoves = computed(() => this.bestMovesByLevel()[this.levelId()] ?? null);
  protected readonly isNewBest = signal(false);

  protected readonly isSolved = computed(() => {
    const puzzle = this.puzzle();
    return puzzle !== null && isSolved(puzzle.board, puzzle.gap);
  });

  /** The tiles with their current cells, tracked by tile so slides animate */
  protected readonly tiles = computed<readonly PlacedTile[]>(() => {
    const puzzle = this.puzzle();
    if (!puzzle) {
      return [];
    }
    const { shape, board, gap } = puzzle;
    return board.flatMap((tile, cell) =>
      tile === null ? [] : [{ tile, cell, number: tileNumber(tile, gap), canMove: canMove(shape, board, cell) }],
    );
  });

  protected readonly time = computed(() => formatTime(this.seconds()));

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      this.bestMovesByLevel.set(readBestMoves());
      this.newPuzzle();
    });
    inject(DestroyRef).onDestroy(() => this.stopTimer());
  }

  protected choosePictureMode(mode: PuzzlePictureMode): void {
    this.pictureMode.set(mode);
    this.newPuzzle();
  }

  protected chooseLevel(id: BoardLevelId): void {
    this.levelId.set(id);
    this.newPuzzle();
  }

  protected newPuzzle(): void {
    this.stopTimer();
    this.puzzle.set(createPuzzle(getPuzzleLevel(this.levelId())));
    this.picture.set(nextPicture(this.picture()?.id ?? null));
    this.moves.set(0);
    this.seconds.set(0);
    this.isNewBest.set(false);
  }

  /** Slides the tile in `cell` into the gap, if it is next to it */
  protected slide(cell: number): void {
    const puzzle = this.puzzle();
    if (!puzzle || this.isSolved() || !canMove(puzzle.shape, puzzle.board, cell)) {
      return;
    }
    if (this.moves() === 0) {
      this.startTimer();
    }
    this.puzzle.set({ ...puzzle, board: move(puzzle.shape, puzzle.board, cell) });
    this.moves.update((moves) => moves + 1);
    if (this.isSolved()) {
      this.finish();
    }
  }

  protected onKey(event: KeyboardEvent): void {
    const direction = ARROWS[event.key];
    const puzzle = this.puzzle();
    if (!direction || !puzzle) {
      return;
    }
    event.preventDefault();
    const cell = cellForArrow(puzzle.shape, puzzle.board, direction);
    if (cell !== null) {
      this.slide(cell);
    }
  }

  /** Position of a cell on the board, as offsets in tile sizes */
  protected position(cell: number): string {
    const columns = this.puzzle()?.shape.columns ?? 1;
    return `translate(${(cell % columns) * 100}%, ${Math.floor(cell / columns) * 100}%)`;
  }

  private finish(): void {
    this.stopTimer();
    const best = this.bestMoves();
    if (best === null || this.moves() < best) {
      this.bestMovesByLevel.update((scores) => ({ ...scores, [this.levelId()]: this.moves() }));
      this.isNewBest.set(true);
      writeStored(BEST_MOVES_STORAGE, this.bestMovesByLevel());
    }
  }

  private startTimer(): void {
    const startedAt = Date.now();
    this.timer = setInterval(() => this.seconds.set(Math.floor((Date.now() - startedAt) / 1000)), 1000);
  }

  private stopTimer(): void {
    clearInterval(this.timer);
  }
}

/** Fewest moves per level saved in this browser, keeping only known levels with whole positive numbers */
function readBestMoves(): BestMoves {
  const stored = readStored(BEST_MOVES_STORAGE);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const scores: BestMoves = {};
  for (const { id } of PUZZLE_LEVELS) {
    const value: unknown = Reflect.get(stored, id);
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      scores[id] = value;
    }
  }
  return scores;
}

/** Seconds as `m:ss`, e.g. `1:05` */
function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
