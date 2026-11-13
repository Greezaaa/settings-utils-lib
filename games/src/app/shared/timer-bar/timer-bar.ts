import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const LOW_SHARE = 0.35;

@Component({
  selector: 'app-timer-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './timer-bar.html',
  styleUrl: './timer-bar.scss',
  host: { 'aria-hidden': 'true' },
})
export class TimerBar {
  readonly share = input.required<number>();
  protected readonly lowShare = LOW_SHARE;
}
