import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-css-tricks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './css-tricks.html',
  styleUrl: './css-tricks.scss',
})
export class CssTricks {
  protected readonly slides: readonly string[] = ['One', 'Two', 'Three', 'Four'];
}
