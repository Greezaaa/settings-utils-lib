import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Direction } from '../../games/sliding-puzzle';

/** Where each line ends: the middle of the tile's edge in that direction (in a 100 × 100 box) */
const LINE_ENDS: Readonly<Record<Direction, { readonly x: number; readonly y: number }>> = {
  up: { x: 50, y: 0 },
  right: { x: 100, y: 50 },
  down: { x: 50, y: 100 },
  left: { x: 0, y: 50 },
};

/**
 * One tile of the sliding puzzle: its piece of the picture, drawn as lines from the centre to the edges it
 * joins, so neighbouring tiles connect when they sit in their place. Optionally shows the tile's number.
 */
@Component({
  selector: 'app-puzzle-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './puzzle-tile.html',
  styleUrl: './puzzle-tile.scss',
})
export class PuzzleTile {
  readonly lines = input.required<readonly Direction[]>();
  /** Number to show in the corner, if any */
  readonly number = input<number | null>(null);

  protected readonly ends = LINE_ENDS;
}
