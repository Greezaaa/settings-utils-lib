import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FillParts } from '../../../games/measure-it';

@Component({
  selector: 'app-fraction-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fraction-view.html',
  styleUrl: './fraction-view.scss',
})
export class FractionView {
  readonly parts = input.required<FillParts>();
}
