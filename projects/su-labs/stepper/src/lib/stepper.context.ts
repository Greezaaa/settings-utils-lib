import { InjectionToken, Signal } from '@angular/core';
import type { SuStepComponent } from './step/step.component';

/** What a step needs from the stepper around it to show itself as a panel */
export interface SuStepperContext {
  readonly steps: Signal<readonly SuStepComponent[]>;
  readonly current: Signal<number>;
  readonly tabs: Signal<boolean>;
  headerId(index: number): string;
  panelId(index: number): string;
}

export const SU_STEPPER = new InjectionToken<SuStepperContext>('SU_STEPPER');
