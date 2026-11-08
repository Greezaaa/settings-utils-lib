import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { readStored, writeStored } from '../../core/site-storage';
import { BoardLevelId } from '../../games/board';
import { canMove, cellForArrow, createPuzzle, Direction, getPuzzleLevel, isSolved, move, neighbour, Puzzle, PUZZLE_LEVELS, tileNumber } from '../../games/sliding-puzzle';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { SiteLanguage } from '../../i18n/site-language';
import { PuzzlePictureMode } from '../../i18n/site-messages';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback';
import { GameClock } from '../../shared/game-clock';
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
const BEST_MOVES_STORAGE = RESULT_GAMES['sliding-puzzle'].storage;
type BestMoves = Partial<Record<BoardLevelId, number>>;

const DEFAULT_LEVEL: BoardLevelId = 'normal';

/** A press on a tile: where it started, to tell a swipe from a tap */
interface Press {
  readonly cell: number;
  readonly pointerId: number;
  readonly x: number;
  readonly y: number;
}

/** Pointer movement, in pixels, from which a press counts as a swipe */
const SWIPE_THRESHOLD = 16;

const ARROWS: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left',
};

/**
 * Sliding puzzle: tap or swipe a tile next to the gap to slide it there, until the picture joins up.
 * Four board sizes, from 2 × 3 to 5 × 5, with tiles showing pieces of a line or of a drawing.
 * Counts moves and time, and remembers the fewest moves per size.
 */
@Component({
  selector: 'app-sliding-puzzle-page',
  imports: [GameBoard, GameFeedback, PictureSlice, PuzzleTile, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sliding-puzzle-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-done.scss', './sliding-puzzle-page.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class SlidingPuzzlePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  /** The youngest recommended age, shown under the title */
  protected readonly minAge = gameInfo('sliding-puzzle').minAge;
  private readonly api = inject(GamesApi);
  /** Sends finished games to the player's account, when signed in */
  private readonly account = inject(PlayerAccount);

  protected readonly levels = PUZZLE_LEVELS;
  protected readonly levelId = signal<BoardLevelId>(DEFAULT_LEVEL);
  protected readonly pictureModes: readonly PuzzlePictureMode[] = ['lines', 'drawing'];
  protected readonly pictureMode = signal<PuzzlePictureMode>('lines');
  /** The drawing the tiles show in drawing mode */
  protected readonly picture = signal<GamePicture | null>(null);

  /** Created in the browser only, so the prerendered page and the first render agree */
  protected readonly puzzle = signal<Puzzle | null>(null);
  protected readonly moves = signal(0);
  protected readonly clock = new GameClock();
  private press: Press | null = null;
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

  constructor() {
    afterNextRender(() => {
      this.bestMovesByLevel.set(readBestMoves());
      this.newPuzzle();
    });
    inject(DestroyRef).onDestroy(() => this.clock.stop());
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
    this.clock.reset();
    this.puzzle.set(createPuzzle(getPuzzleLevel(this.levelId())));
    this.picture.set(nextPicture(this.picture()?.id ?? null));
    this.moves.set(0);
    this.isNewBest.set(false);
  }

  /** Slides the tile in `cell` into the gap, if it is next to it */
  protected slide(cell: number): void {
    const puzzle = this.puzzle();
    if (!puzzle || this.isSolved() || !canMove(puzzle.shape, puzzle.board, cell)) {
      return;
    }
    if (this.moves() === 0) {
      this.clock.start();
      // The first move starts the game: count it as a play
      this.api.countPlay('sliding-puzzle');
    }
    this.puzzle.set({ ...puzzle, board: move(puzzle.shape, puzzle.board, cell) });
    this.moves.update((moves) => moves + 1);
    if (this.isSolved()) {
      this.finish();
    }
  }

  protected onPointerDown(event: PointerEvent, cell: number): void {
    if (!event.isPrimary) {
      return;
    }
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    this.press = { cell, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  /** A swipe slides the tile when the gap lies in the direction of the swipe; taps are clicks */
  protected onPointerUp(event: PointerEvent): void {
    const press = this.press;
    this.press = null;
    const puzzle = this.puzzle();
    if (press?.pointerId !== event.pointerId || !puzzle) {
      return;
    }
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (Math.hypot(dx, dy) < SWIPE_THRESHOLD) {
      return;
    }
    const direction: Direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    if (neighbour(puzzle.shape, press.cell, direction) === puzzle.board.indexOf(null)) {
      this.slide(press.cell);
    }
  }

  protected cancelPress(): void {
    this.press = null;
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
    this.clock.stop();
    this.account.record('sliding-puzzle', this.levelId(), this.moves());
    const best = this.bestMoves();
    if (best === null || this.moves() < best) {
      this.bestMovesByLevel.update((scores) => ({ ...scores, [this.levelId()]: this.moves() }));
      this.isNewBest.set(true);
      writeStored(BEST_MOVES_STORAGE, this.bestMovesByLevel());
    }
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
