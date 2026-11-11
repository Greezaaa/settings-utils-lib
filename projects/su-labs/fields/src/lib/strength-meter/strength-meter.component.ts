import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { SU_DEFAULT_MIN_PASSWORD_LENGTH, SU_STRENGTH_LEVELS, suPasswordStrength, SuStrengthLevel, suStrengthLevel } from './password-strength';

/**
 * Four bars under a new password that fill, and change colour, as the password gets stronger. It follows the field's
 * own typing, so forms keep their plain fields; a form that empties the field by code sends it an `input` event.
 * Its texts come in as inputs, so it fits any language.
 */
@Component({
  selector: 'su-lib-strength-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './strength-meter.component.html',
  styleUrl: './strength-meter.component.scss',
})
export class SuStrengthMeterComponent {
  readonly field = input.required<HTMLInputElement>();
  /** The meter's name for screen readers, e.g. "Password strength" */
  readonly label = input.required<string>();
  /** The word shown for each step */
  readonly levelNames =
    input.required<Readonly<Record<SuStrengthLevel, string>>>();
  readonly minLength = input(SU_DEFAULT_MIN_PASSWORD_LENGTH);

  private readonly password = signal('');
  protected readonly steps = SU_STRENGTH_LEVELS;
  protected readonly bars = computed(() =>
    suPasswordStrength(this.password(), this.minLength())
  );
  protected readonly level = computed(() => suStrengthLevel(this.bars()));
  protected readonly levelName = computed(() => {
    const level = this.level();
    return level ? this.levelNames()[level] : null;
  });

  constructor() {
    effect(onCleanup => {
      const field = this.field();
      const read = () => this.password.set(field.value);
      read();
      field.addEventListener('input', read);
      onCleanup(() => field.removeEventListener('input', read));
    });
  }
}
