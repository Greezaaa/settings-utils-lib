import { booleanAttribute, ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';

/**
 * A real checkbox whose tick draws itself in, with a small squash when pressed and a dash when partly checked. Put the
 * label inside: `<su-lib-checkbox [(checked)]="agree">I agree</su-lib-checkbox>`.
 */
@Component({
  selector: 'su-lib-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class SuCheckboxComponent {
  readonly checked = input(false, { transform: booleanAttribute });
  /** Partly checked, e.g. some of a group; a click checks it */
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Ticked or unticked by the user: the new value */
  readonly checkedChange = output<boolean>();

  protected readonly shown = linkedSignal(() => this.checked());

  protected onChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.shown.set(event.target.checked);
      this.checkedChange.emit(event.target.checked);
    }
  }
}
