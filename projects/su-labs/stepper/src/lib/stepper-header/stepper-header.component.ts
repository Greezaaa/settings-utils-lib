import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SuStepperLabels, SuStepView } from '@su-labs/core/stepper';

/** A step's circle with its number and its label, with the step's place and state for screen readers */
@Component({
  selector: 'su-lib-stepper-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stepper-header.component.html',
  styleUrl: './stepper-header.component.scss',
  host: {
    class: 'su-stepper-header-content',
    '[class.is-current]': 'step().current',
    '[class.is-completed]': 'step().completed',
    '[class.is-visited]': 'step().visited',
    '[class.is-disabled]': 'step().disabled',
  },
})
export class SuStepperHeaderComponent {
  readonly step = input.required<SuStepView>();
  readonly count = input.required<number>();
  readonly labels = input.required<SuStepperLabels>();

  protected readonly description = computed(() => {
    const step = this.step();
    const labels = this.labels();
    return [
      labels.step(step.number, this.count()),
      step.label,
      step.completed ? labels.completed : null,
      step.disabled ? labels.unavailable : null,
    ]
      .filter(part => part !== null)
      .join(', ');
  });
}
