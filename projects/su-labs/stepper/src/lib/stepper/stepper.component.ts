import { afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChildren, DestroyRef, effect, ElementRef, inject, input, model, signal, untracked, viewChildren } from '@angular/core';
import { SU_STEPPER_LABELS, SuStepperController, SuStepperLabels, SuStepperOrientation } from '@su-labs/core/stepper';
import { SuStepComponent } from '../step/step.component';
import { SU_STEPPER, SuStepperContext } from '../stepper.context';
import { SuStepperHeaderComponent } from '../stepper-header/stepper-header.component';

let nextStepperId = 0;

/** Keys that move focus between the step headers when they act as tabs, and where each one goes */
const TAB_KEYS: Readonly<
  Record<string, (index: number, count: number) => number>
> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

/**
 * Content split into steps (`su-lib-step`) shown one at a time, over `SuStepperController` from
 * `@su-labs/core/stepper`: a numbered circle per step joined by a line, horizontal or vertical, with Back and Next
 * buttons that follow each step's rules. With `tabs`, the step headers act as tabs too, still following the rules.
 */
@Component({
  selector: 'su-lib-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SuStepperHeaderComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  providers: [{ provide: SU_STEPPER, useExisting: SuStepperComponent }],
  host: {
    class: 'su-stepper',
    '[class.su-stepper-vertical]': "orientation() === 'vertical'",
  },
})
export class SuStepperComponent implements SuStepperContext {
  /** @default 'horizontal' */
  readonly orientation = input<SuStepperOrientation>('horizontal');
  /** The step headers act as tabs: clicking one goes to its step, if the rules allow it @default false */
  readonly tabs = input(false, { transform: booleanAttribute });
  /** Going forward by more than one step only reaches steps already visited @default false */
  readonly linear = input(false, { transform: booleanAttribute });
  /** Back and Next buttons under the steps; without them, call `next()` and `back()` from your own @default true */
  readonly controls = input(true, { transform: booleanAttribute });
  /** The name of the list of steps for screen readers @default labels.steps */
  readonly label = input<string>();
  /** Texts to replace, e.g. in the page's language */
  readonly labels = input<Partial<SuStepperLabels>>({});
  /** The step on screen, from 0; setting it shows that step without checking the rules */
  readonly current = model(0);

  readonly steps = contentChildren(SuStepComponent);

  private readonly controller = new SuStepperController();
  protected readonly state = signal(this.controller.state.get());
  protected readonly text = computed<SuStepperLabels>(() => ({
    ...SU_STEPPER_LABELS,
    ...this.labels(),
  }));
  private readonly tabButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('tab');
  /** The step's content takes focus once it renders, after a move the user made with the buttons */
  private focusPending = false;
  private readonly id = `su-stepper-${nextStepperId++}`;

  constructor() {
    const unsubscribe = this.controller.state.subscribe(state => {
      this.state.set(state);
      this.current.set(state.current);
    });
    inject(DestroyRef).onDestroy(unsubscribe);

    effect(() => {
      const steps = this.steps().map(step => step.options());
      const linear = this.linear();
      const current = this.current();
      untracked(() => {
        this.controller.setSteps(steps);
        this.controller.setLinear(linear);
        this.controller.select(current);
      });
    });

    afterRenderEffect(() => {
      const current = this.state().current;
      if (this.focusPending) {
        this.focusPending = false;
        untracked(() => this.steps()[current]?.focus());
      }
    });
  }

  /** Goes to the next step that isn't disabled, if the current one allows it; returns whether it moved */
  next(): boolean {
    return this.controller.next();
  }

  /** Goes to the previous step that isn't disabled, if the current one allows it; returns whether it moved */
  back(): boolean {
    return this.controller.back();
  }

  /** Goes to a step, from 0, if the rules allow it; returns whether it moved */
  goTo(index: number): boolean {
    return this.controller.goTo(index);
  }

  /** Starts over: back to a step (the first by default) with nothing visited or completed */
  reset(start = 0): void {
    this.controller.reset(start);
  }

  headerId(index: number): string {
    return `${this.id}-step-${index}`;
  }

  panelId(index: number): string {
    return `${this.id}-panel-${index}`;
  }

  protected onNext(): void {
    this.focusPending = this.next();
  }

  protected onBack(): void {
    this.focusPending = this.back();
  }

  protected onTabKeydown(event: KeyboardEvent, index: number): void {
    const target = TAB_KEYS[event.key];
    const buttons = this.tabButtons();
    if (!target || buttons.length === 0) {
      return;
    }
    event.preventDefault();
    buttons[target(index, buttons.length)]?.nativeElement.focus();
  }
}
