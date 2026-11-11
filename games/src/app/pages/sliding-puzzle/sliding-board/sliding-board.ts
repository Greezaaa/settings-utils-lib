import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GamePicture } from '../../../core/pictures';
import { canMove, cellForArrow, Direction, isSolved, neighbour, Puzzle, tileNumber } from '../../../games/sliding-puzzle';
import { PuzzlePictureMode } from '../../../i18n/site-messages';
import { PictureSlice } from '../../../shared/picture-slice/picture-slice';
import { PuzzleTile } from '../puzzle-tile/puzzle-tile';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/** A tile on the board: which piece it is and the cell it sits in now */
interface PlacedTile {
  readonly tile: number;
  readonly cell: number;
  readonly number: number;
  readonly canMove: boolean;
}

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
 * The board of the sliding puzzle: tap, swipe or use the arrow keys to slide a tile next to the gap. Shared by the
 * game's page and its room round, which keep the puzzle and slide the tiles they're told.
 */
@Component({
  selector: 'app-sliding-board',
  imports: [TranslatePipe, PictureSlice, PuzzleTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sliding-board.html',
  styleUrl: './sliding-board.scss',
  host: { style: 'display: contents', '(document:keydown)': 'onKey($event)' },
})
export class SlidingBoard {
  readonly puzzle = input.required<Puzzle>();
  readonly pictureMode = input.required<PuzzlePictureMode>();
  /** The drawing the tiles show in drawing mode */
  readonly picture = input<GamePicture | null>(null);
  /** The cell of the tile to slide into the gap */
  readonly slid = output<number>();

  private press: Press | null = null;

  protected readonly isSolved = computed(() => isSolved(this.puzzle().board, this.puzzle().gap));

  /** The tiles with their current cells, tracked by tile so slides animate */
  protected readonly tiles = computed<readonly PlacedTile[]>(() => {
    const { shape, board, gap } = this.puzzle();
    return board.flatMap((tile, cell) =>
      tile === null ? [] : [{ tile, cell, number: tileNumber(tile, gap), canMove: canMove(shape, board, cell) }],
    );
  });

  protected slide(cell: number): void {
    const { shape, board } = this.puzzle();
    if (!this.isSolved() && canMove(shape, board, cell)) {
      this.slid.emit(cell);
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
    if (press?.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (Math.hypot(dx, dy) < SWIPE_THRESHOLD) {
      return;
    }
    const { shape, board } = this.puzzle();
    const direction: Direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
    if (neighbour(shape, press.cell, direction) === board.indexOf(null)) {
      this.slide(press.cell);
    }
  }

  protected cancelPress(): void {
    this.press = null;
  }

  protected onKey(event: KeyboardEvent): void {
    const direction = ARROWS[event.key];
    if (!direction) {
      return;
    }
    event.preventDefault();
    const { shape, board } = this.puzzle();
    const cell = cellForArrow(shape, board, direction);
    if (cell !== null) {
      this.slide(cell);
    }
  }

  /** Position of a cell on the board, as offsets in tile sizes */
  protected position(cell: number): string {
    const { columns } = this.puzzle().shape;
    return `translate(${(cell % columns) * 100}%, ${Math.floor(cell / columns) * 100}%)`;
  }
}
