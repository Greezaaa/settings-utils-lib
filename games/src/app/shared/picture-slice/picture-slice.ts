import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Shape } from '../../games/board';

@Component({
  selector: 'app-picture-slice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picture-slice.html',
  styleUrl: './picture-slice.scss',
})
export class PictureSlice {
  readonly src = input.required<string>();
  readonly shape = input.required<Shape>();
  readonly cell = input.required<number>();

  protected readonly placement = computed(() => {
    const { rows, columns } = this.shape();
    const row = Math.floor(this.cell() / columns);
    const column = this.cell() % columns;
    const cropRows = (columns - rows) / 2;
    return { width: columns * 100, left: -column * 100, top: -(row + cropRows) * 100 };
  });
}
