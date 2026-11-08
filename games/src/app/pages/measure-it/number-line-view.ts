import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LineExercise, lineEnd } from '../../games/measure-it';

const LEFT = 20;
const RIGHT = 300;
const Y = 40;

/** Numbers as people write them: no long decimals (0.5, −2.25) */
export const formatNumber = (value: number): string =>
  String(Math.round(value * 100) / 100).replace('-', '−');

/** A number line with only its ends numbered, its ticks, and an x over the tick to find */
@Component({
  selector: 'app-number-line-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './number-line-view.html',
  styleUrl: './measure-views.scss',
})
export class NumberLineView {
  readonly line = input.required<LineExercise>();

  protected readonly axis = { x1: LEFT - 10, x2: RIGHT + 10, y: Y };
  protected readonly ticks = computed(() => {
    const { gaps, mark } = this.line();
    return Array.from({ length: gaps + 1 }, (_, tick) => ({
      tick,
      x: LEFT + ((RIGHT - LEFT) * tick) / gaps,
      isMark: tick === mark,
    }));
  });
  protected readonly startLabel = computed(() =>
    formatNumber(this.line().start)
  );
  protected readonly endLabel = computed(() =>
    formatNumber(lineEnd(this.line()))
  );
  protected readonly ends = { left: LEFT, right: RIGHT, y: Y };
}
