import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SuStepperOrientation } from '@su-labs/core/stepper';
import { SuStepComponent, SuStepperComponent } from '@su-labs/stepper';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { PageFeatureExample } from '../../shared/page-feature';
import { UtilityPage } from '../../shared/utility-page';
import { STEPPER_FEATURES } from './stepper-features';

const ORIENTATIONS: readonly SuStepperOrientation[] = ['horizontal', 'vertical'];

const PLANS: readonly string[] = ['Free', 'Team', 'Business'];

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `<su-lib-stepper label="Sign up" [(current)]="step">
  <su-lib-step label="Account" [canNext]="name().length > 0">
    <label>
      Name
      <input #nameInput [value]="name()" (input)="name.set(nameInput.value)" />
    </label>
  </su-lib-step>
  <su-lib-step label="Plan">…</su-lib-step>
  <su-lib-step label="Confirm" [canBack]="false">…</su-lib-step>
</su-lib-stepper>`,
  },
  {
    label: 'Other frameworks',
    code: `import { SuStepperController } from '@su-labs/core/stepper';

const steps = () => [
  { label: 'Account', canNext: nameInput.value.length > 0 },
  { label: 'Plan' },
  { label: 'Confirm', canBack: false },
];
const stepper = new SuStepperController({ steps: steps() });

stepper.state.subscribe((state) => render(state));
nameInput.addEventListener('input', () => stepper.setSteps(steps()));
nextButton.addEventListener('click', () => stepper.next());
backButton.addEventListener('click', () => stepper.back());`,
  },
  {
    label: 'CSS',
    code: `su-lib-stepper {
  --su-stepper-accent: #0f766e;
  --su-stepper-marker-size: 2.25rem;
  --su-stepper-line-color: #d4d4d8;
}`,
  },
];

@Component({
  selector: 'app-stepper-page',
  imports: [PageFeatureExample, SuStepComponent, SuStepperComponent, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stepper-page.html',
  styleUrl: './stepper-page.scss',
})
export class StepperPage {
  protected readonly utility = getUtility('stepper');
  protected readonly usage = USAGE;
  protected readonly features = STEPPER_FEATURES;
  protected readonly orientations = ORIENTATIONS;
  protected readonly plans = PLANS;

  protected readonly orientation = signal<SuStepperOrientation>('horizontal');
  protected readonly titles = signal(true);
  protected readonly tabs = signal(false);
  protected readonly linear = signal(false);
  protected readonly current = signal(0);
  protected readonly name = signal('');
  protected readonly plan = signal(PLANS[0] ?? '');
  protected readonly hasName = computed(() => this.name().trim().length > 0);
  protected readonly requireName = signal(true);
  protected readonly accountDone = computed(() => !this.requireName() || this.hasName());

  protected readonly agreed = signal(false);

  protected startOver(stepper: SuStepperComponent): void {
    this.name.set('');
    this.plan.set(PLANS[0] ?? '');
    stepper.reset();
  }

  protected label(title: string): string | undefined {
    return this.titles() ? title : undefined;
  }

  protected chooseOrientation(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const { value } = event.target;
      const option = ORIENTATIONS.find((item) => item === value);
      if (option) {
        this.orientation.set(option);
      }
    }
  }

  protected setFlag(flag: (value: boolean) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      flag(event.target.checked);
    }
  }

  protected setText(text: (value: string) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      text(event.target.value);
    }
  }
}
