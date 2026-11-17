import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SuAutoGrowDirective, SuCheckboxComponent, SuChipOption, SuChipsComponent, SuCodeBoxesComponent, SuEmailFieldComponent, SuStrengthLevel, SuStrengthMeterComponent, SuSwitchComponent } from '@su-labs/fields';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { PageFeatureExample } from '../../shared/page-feature';
import { UtilityPage } from '../../shared/utility-page';
import { FIELDS_FEATURES } from './fields-features';

const CODE_LENGTH = 6;
const CODE_PATTERN = /^[A-Z0-9]{6}$/;

const LEVEL_NAMES: Readonly<Record<SuStrengthLevel, string>> = {
  weak: 'Weak',
  fair: 'Fair',
  good: 'Good',
  strong: 'Strong',
};

type Topic = 'logic' | 'words' | 'numbers' | 'music';

const TOPICS: readonly SuChipOption<Topic>[] = [
  { value: 'logic', label: 'Logic' },
  { value: 'words', label: 'Words' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'music', label: 'Music' },
];

const NEWS = ['New games', 'Weekly scores', 'Tips'] as const;

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
    label: 'Email',
    code: `<su-lib-email-field label="Email" required [(value)]="email" (validityChange)="emailOk.set($event)" />

// suggests a common domain for a typo: jo@gmial.com → jo@gmail.com`,
  },
  {
    label: 'Checkbox',
    code: `<su-lib-checkbox [(checked)]="agree">I agree to the terms</su-lib-checkbox>
<su-lib-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="selectAll($event)">
  Select all
</su-lib-checkbox>`,
  },
  {
    label: 'Chips',
    code: `topics: readonly SuChipOption<Topic>[] = [
  { value: 'logic', label: 'Logic' },
  { value: 'words', label: 'Words' },
];
picked = signal<readonly Topic[]>([]);

<su-lib-chips label="Topics" [options]="topics" [(value)]="picked" />`,
  },
  {
    label: 'Switch',
    code: `<su-lib-switch [(checked)]="notify">Email me about new games</su-lib-switch>

<!-- label first, small, while saving -->
<su-lib-switch labelPosition="start" size="small" [checked]="isPublic()" [busy]="saving()"
  (checkedChange)="save($event)">
  Show me on the leaderboard
</su-lib-switch>`,
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
  imports: [
    PageFeatureExample,
    SuAutoGrowDirective,
    SuCheckboxComponent,
    SuChipsComponent,
    SuCodeBoxesComponent,
    SuEmailFieldComponent,
    SuStrengthMeterComponent,
    SuSwitchComponent,
    UtilityPage,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fields-page.html',
  styleUrl: './fields-page.scss',
})
export class FieldsPage {
  protected readonly utility = getUtility('fields');
  protected readonly features = FIELDS_FEATURES;
  protected readonly themedSwitch = signal(true);
  protected readonly themedCheck = signal(true);
  protected readonly usage = USAGE;
  protected readonly codeLength = CODE_LENGTH;
  protected readonly levelNames = LEVEL_NAMES;
  protected readonly code = signal('');
  protected readonly isCodeComplete = computed(() => CODE_PATTERN.test(this.code()));
  protected readonly notify = signal(true);
  protected readonly compact = signal(false);
  protected readonly email = signal('');
  protected readonly emailOk = signal(false);
  protected readonly topics = TOPICS;
  protected readonly pickedTopics = signal<readonly Topic[]>(['logic']);
  protected readonly news = NEWS;
  protected readonly newsPicked = signal<ReadonlySet<string>>(new Set(['New games']));
  protected readonly allNews = computed(() => this.newsPicked().size === NEWS.length);
  protected readonly someNews = computed(() => this.newsPicked().size > 0 && !this.allNews());

  protected setNews(item: string, picked: boolean): void {
    this.newsPicked.update((current) => {
      const next = new Set(current);
      if (picked) {
        next.add(item);
      } else {
        next.delete(item);
      }
      return next;
    });
  }

  protected setAllNews(picked: boolean): void {
    this.newsPicked.set(new Set(picked ? NEWS : []));
  }
}
