import { booleanAttribute, ChangeDetectionStrategy, Component, computed, effect, input, model, output, signal } from '@angular/core';
import { SU_COMMON_EMAIL_DOMAINS, suCheckEmail, SuEmailProblem } from './email-check';

/** The field's texts, e.g. in the page's language */
export interface SuEmailMessages extends Readonly<Record<SuEmailProblem, string>> {
  /** Before a suggested address: "Did you mean jo@gmail.com?" */
  readonly suggestion: string;
}

export const SU_EMAIL_MESSAGES: SuEmailMessages = {
  empty: 'Enter your email address',
  spaces: 'An email address has no spaces',
  at: 'An email address has one @, like name@example.com',
  name: 'Add the part before the @',
  domain: 'Add the part after the @, like example.com',
  dot: 'The part after the @ needs a dot, like example.com',
  ending: 'The ending after the last dot needs at least two letters',
  suggestion: 'Did you mean',
};

let nextId = 0;

/**
 * An email field that checks the address the way people mistype it, and suggests a common domain for a likely typo
 * (`gmial.com` → `gmail.com`, applied with one tap). It stays quiet while typing and says what's wrong once the field
 * is left; a tick shows when the address looks right.
 */
@Component({
  selector: 'su-lib-email-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-floating]': 'floating()' },
  templateUrl: './email-field.component.html',
  styleUrl: './email-field.component.scss',
})
export class SuEmailFieldComponent {
  readonly value = model('');
  /** The visible label */
  readonly label = input.required<string>();
  readonly placeholder = input<string>();
  /** An empty field counts as a problem @default false */
  readonly required = input(false, { transform: booleanAttribute });
  readonly messages = input<Partial<SuEmailMessages>>({});
  /** The label sits inside the field and moves up onto its border when the field is focused or filled @default false */
  readonly floating = input(false, { transform: booleanAttribute });
  /** Shows the problem before the field was left, e.g. when its form is sent @default false */
  readonly showProblem = input(false, { transform: booleanAttribute });
  /** Domains to suggest when one is mistyped */
  readonly domains = input<readonly string[]>(SU_COMMON_EMAIL_DOMAINS);
  /** Whether the address is valid, on every change */
  readonly validityChange = output<boolean>();

  protected readonly id = `su-email-${nextId++}`;
  protected readonly touched = signal(false);
  protected readonly check = computed(() => suCheckEmail(this.value(), this.domains()));
  protected readonly text = computed<SuEmailMessages>(() => ({ ...SU_EMAIL_MESSAGES, ...this.messages() }));
  /** The problem to show: once the field was left or `showProblem` is on, and an empty field only when it's required */
  protected readonly problem = computed(() => {
    const { problem } = this.check();
    const isShown = this.touched() || this.showProblem();
    if (!isShown || !problem || (problem === 'empty' && !this.required())) {
      return null;
    }
    return problem;
  });

  constructor() {
    effect(() => this.validityChange.emit(this.check().valid));
  }

  protected onInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.value.set(event.target.value);
    }
  }

  protected apply(suggestion: string): void {
    this.value.set(suggestion);
    this.touched.set(true);
  }
}
