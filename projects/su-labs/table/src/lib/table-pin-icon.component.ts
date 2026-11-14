import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The pin drawn on pinned columns and pin buttons: `<svg suTablePinIcon></svg>` */
@Component({
  selector: 'svg[suTablePinIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { viewBox: '0 0 16 16', 'aria-hidden': 'true', fill: 'currentColor' },
  template: `<svg:path
    d="M10 1.5 14.5 6l-1.6 1.6-1-.3-2.4 2.4.2 2.8-1.3 1.3L6 11 2.5 14.5 1.5 13.5 5 10 2.2 7.6l1.3-1.3 2.8.2 2.4-2.4-.3-1z" />`,
})
export class SuTablePinIconComponent {}
