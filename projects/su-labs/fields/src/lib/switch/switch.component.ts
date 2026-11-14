import { booleanAttribute, ChangeDetectionStrategy, Component, effect, input, linkedSignal, output, untracked } from '@angular/core';

/** Where the label sits: after the switch, or before it with the switch at the end of the row */
export type SuSwitchLabelPosition = 'start' | 'end';

export type SuSwitchSize = 'small' | 'medium';

/**
 * A real checkbox (`role="switch"`) drawn as a sliding switch: the knob stretches while pressed, springs across and a
 * tick pops in when it's on. Put the label inside: `<su-lib-switch [(checked)]="on">Reduce motion</su-lib-switch>`.
 *
 * It shows a click at once and follows `checked` whenever it changes. While `busy` (e.g. saving the change) it ignores
 * clicks, and once no longer busy it shows `checked` again, so a change that failed to save flips back.
 */
@Component({
  selector: 'su-lib-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.component.html',
  styleUrl: './switch.component.scss',
})
export class SuSwitchComponent {
  readonly checked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Busy saving the change: clicks are ignored, and `aria-busy` is set */
  readonly busy = input(false, { transform: booleanAttribute });
  /** @default 'end' */
  readonly labelPosition = input<SuSwitchLabelPosition>('end');
  /** @default 'medium' */
  readonly size = input<SuSwitchSize>('medium');
  /** Switched by the user: the new value */
  readonly checkedChange = output<boolean>();

  protected readonly shown = linkedSignal(() => this.checked());

  constructor() {
    effect(() => {
      if (!this.busy()) {
        untracked(() => this.shown.set(this.checked()));
      }
    });
  }

  protected onClick(event: MouseEvent): void {
    if (this.busy()) {
      event.preventDefault();
    }
  }

  protected onChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.shown.set(event.target.checked);
      this.checkedChange.emit(event.target.checked);
    }
  }
}
