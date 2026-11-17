import { SuStepperLabels } from './stepper.types';

/** The default English texts */
export const SU_STEPPER_LABELS: SuStepperLabels = {
  steps: 'Steps',
  step: (number, count) => `Step ${number} of ${count}`,
  completed: 'Completed',
  unavailable: 'Unavailable',
  back: 'Back',
  next: 'Next',
};
