import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Share of time left below which the bar blinks */
const LOW_SHARE = 0.35;

/** The bar that empties as time runs out; blinks when time is short */
@Component({
  selector: 'app-timer-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timer-bar.html',
  styleUrl: './timer-bar.scss',
  host: { 'aria-hidden': 'true' },
})
export class TimerBar {
  /** From 1 (full) to 0 (empty) */
  readonly share = input.required<number>();
  protected readonly lowShare = LOW_SHARE;
}
