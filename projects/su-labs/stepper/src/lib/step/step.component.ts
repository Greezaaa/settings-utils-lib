import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input } from '@angular/core';
import { SuStepOptions } from '@su-labs/core/stepper';
import { SU_STEPPER } from '../stepper.context';

/**
 * One step of `su-lib-stepper`: its content shows while it's the current step. Its rules say when the user may leave
 * it, e.g. `[canNext]="form.valid"`.
 */
@Component({
  selector: 'su-lib-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step.component.html',
  styleUrl: './step.component.scss',
  host: {
    class: 'su-stepper-panel',
    tabindex: '-1',
    '[id]': 'panelId()',
    '[attr.role]': "stepper.tabs() ? 'tabpanel' : 'group'",
    '[attr.aria-labelledby]': 'headerId()',
    '[hidden]': '!isCurrent()',
  },
})
export class SuStepComponent {
  /** The text beside the step's number; without it, only the number shows */
  readonly label = input<string>();
  /** The user may go forward from this step, e.g. once its form is valid @default true */
  readonly canNext = input(true, { transform: booleanAttribute });
  /** The user may go back from this step @default true */
  readonly canBack = input(true, { transform: booleanAttribute });
  /** The step can't be visited; moving forward or back skips it @default false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** The step's options for `SuStepperController` */
  readonly options = computed<SuStepOptions>(() => ({
    label: this.label(),
    canNext: this.canNext(),
    canBack: this.canBack(),
    disabled: this.disabled(),
  }));

  protected readonly stepper = inject(SU_STEPPER);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly index = computed(() => this.stepper.steps().indexOf(this));
  protected readonly isCurrent = computed(
    () => this.index() === this.stepper.current()
  );
  protected readonly panelId = computed(() =>
    this.stepper.panelId(this.index())
  );
  protected readonly headerId = computed(() =>
    this.stepper.headerId(this.index())
  );

  /** Moves keyboard focus to the step's content */
  focus(): void {
    this.host.nativeElement.focus();
  }
}
