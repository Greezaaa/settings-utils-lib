import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Shape } from '../games/board';

/**
 * One square piece of a picture: the part that belongs to a cell of a board.
 * Board tiles are always square, so a square picture covers the board's width and, on boards wider than
 * tall, is cropped evenly at the top and bottom.
 */
@Component({
  selector: 'app-picture-slice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picture-slice.html',
  styleUrl: './picture-slice.scss',
})
export class PictureSlice {
  readonly src = input.required<string>();
  readonly shape = input.required<Shape>();
  /** Cell of the board this piece shows */
  readonly cell = input.required<number>();

  /** The whole picture, sized and moved so only this cell's part shows through the tile */
  protected readonly placement = computed(() => {
    const { rows, columns } = this.shape();
    const row = Math.floor(this.cell() / columns);
    const column = this.cell() % columns;
    // On wide boards the picture is taller than the board: centre it, cropping top and bottom evenly
    const cropRows = (columns - rows) / 2;
    return { width: columns * 100, left: -column * 100, top: -(row + cropRows) * 100 };
  });
}
