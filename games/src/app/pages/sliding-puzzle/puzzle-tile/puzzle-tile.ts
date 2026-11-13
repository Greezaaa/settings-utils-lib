import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Direction } from '../../../games/sliding-puzzle';

const LINE_ENDS: Readonly<Record<Direction, { readonly x: number; readonly y: number }>> = {
  up: { x: 50, y: 0 },
  right: { x: 100, y: 50 },
  down: { x: 50, y: 100 },
  left: { x: 0, y: 50 },
};

@Component({
  selector: 'app-puzzle-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './puzzle-tile.html',
  styleUrl: './puzzle-tile.scss',
})
export class PuzzleTile {
  readonly lines = input.required<readonly Direction[]>();
  readonly number = input<number | null>(null);

  protected readonly ends = LINE_ENDS;
}
