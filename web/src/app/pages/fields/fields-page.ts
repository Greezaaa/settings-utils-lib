import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SuAutoGrowDirective, SuCodeBoxesComponent, SuStrengthLevel, SuStrengthMeterComponent } from '@su-labs/fields';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { UtilityPage } from '../../shared/utility-page';

const CODE_LENGTH = 6;
const CODE_PATTERN = /^[A-Z0-9]{6}$/;

const LEVEL_NAMES: Readonly<Record<SuStrengthLevel, string>> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

const USAGE: readonly CodeTab[] = [
  {
    label: 'Code boxes',
    code: `<su-lib-code-boxes [(value)]="code" [length]="6" label="Code" [complete]="isComplete()" />

// component
protected readonly code = signal('');
protected readonly isComplete = computed(() => /^[A-Z0-9]{6}$/.test(this.code()));`,
  },
  {
    label: 'Strength meter',
    code: `<input #password type="password" autocomplete="new-password" />
<su-lib-strength-meter
  [field]="password"
  label="Password strength"
  [levelNames]="{ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }"
  [minLength]="10"
/>`,
  },
  {
    label: 'Auto grow',
    code: `<textarea suAutoGrow rows="2"></textarea>`,
  },
  {
    label: 'CSS',
    code: `:root {
  --su-field-accent: #3b82f6;
  --su-field-success: #2e8b57;
  --su-field-success-bg: #e6f4ea;
  --su-field-warning: #c98a00;
  --su-field-danger: #c0392b;
}`,
  },
];

@Component({
  selector: 'app-fields-page',
  imports: [SuAutoGrowDirective, SuCodeBoxesComponent, SuStrengthMeterComponent, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fields-page.html',
  styleUrl: './fields-page.scss',
})
export class FieldsPage {
  protected readonly utility = getUtility('fields');
  protected readonly usage = USAGE;
  protected readonly codeLength = CODE_LENGTH;
  protected readonly levelNames = LEVEL_NAMES;
  protected readonly code = signal('');
  protected readonly isCodeComplete = computed(() => CODE_PATTERN.test(this.code()));
}
