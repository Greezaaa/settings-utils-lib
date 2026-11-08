import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FillParts } from '../../games/measure-it';

/** A fraction written the way kids learn it: the numerator over a line over the denominator, after any whole number */
@Component({
  selector: 'app-fraction-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fraction-view.html',
  styleUrl: './fraction-view.scss',
})
export class FractionView {
  readonly parts = input.required<FillParts>();
}
