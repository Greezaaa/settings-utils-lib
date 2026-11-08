import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Fill } from '../../games/measure-it';

/** The glass's inside, in the drawing's units: straight sides, so the water's height is exactly the fraction */
const TOP = 10;
const BOTTOM = 150;
const LEFT = 14;
const WIDTH = 72;

/** One glass or more (whole full glasses first, then the part-filled one), filled to `fill`; up to 10 */
@Component({
  selector: 'app-glass-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './glass-view.html',
  styleUrl: './measure-views.scss',
})
export class GlassView {
  readonly fill = input.required<Fill>();

  protected readonly inside = {
    x: LEFT,
    y: TOP,
    width: WIDTH,
    height: BOTTOM - TOP,
  };
  /** Each glass with its water level, as a share of its height */
  protected readonly glasses = computed(() => {
    const { whole, numerator, denominator } = this.fill();
    return [
      ...Array.from({ length: whole }, () => 1),
      numerator / denominator,
    ].map((share, index) => ({
      index,
      waterY: BOTTOM - (BOTTOM - TOP) * share,
      waterHeight: (BOTTOM - TOP) * share,
    }));
  });
}
