import { Directive, input } from '@angular/core';
import { SuTablePin } from '@su-labs/core/table';

/** Where one cell of a pinned column sticks */
export interface SuTablePinPlacement {
  readonly pin: SuTablePin;
  /** The distance from its edge: the width of the pinned cells before it */
  readonly offset: number;
  /** The innermost pinned cell on its side, which casts the shadow over the scrolling cells */
  readonly edge: boolean;
}

/** Makes a table cell stick to its edge while the other columns scroll */
@Directive({
  selector: '[suTablePin]',
  host: {
    '[class.is-pinned-start]': "placement()?.pin === 'start'",
    '[class.is-pinned-end]': "placement()?.pin === 'end'",
    '[class.is-pinned-edge]': 'placement()?.edge',
    '[style.inset-inline-start.px]':
      "placement()?.pin === 'start' ? placement()?.offset : null",
    '[style.inset-inline-end.px]':
      "placement()?.pin === 'end' ? placement()?.offset : null",
  },
})
export class SuTablePinDirective {
  readonly placement = input<SuTablePinPlacement | null>(null, {
    alias: 'suTablePin',
  });
}
