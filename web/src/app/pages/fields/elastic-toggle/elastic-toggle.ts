import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { formatLinear, simulate } from '../../spring-easing/spring';

const SETTLE_MOTION = simulate({ stiffness: 300, damping: 16, mass: 1 });

@Component({
  selector: 'app-elastic-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './elastic-toggle.html',
  styleUrl: './elastic-toggle.scss',
  host: {
    '[style.--toggle-settle-easing]': 'settleEasing',
    '[style.--toggle-settle-duration]': 'settleDuration',
  },
})
export class ElasticToggle {
  readonly label = input.required<string>();
  readonly checked = model(false);

  protected readonly settleEasing = formatLinear(SETTLE_MOTION);
  protected readonly settleDuration = `${SETTLE_MOTION.duration}ms`;

  protected toggle(): void {
    this.checked.update((checked) => !checked);
  }
}
