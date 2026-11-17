import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { parseColor, rgbToHex } from '../color';

let nextId = 0;

@Component({
  selector: 'app-color-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './color-field.html',
  styleUrl: './color-field.scss',
})
export class ColorField {
  readonly label = input.required<string>();
  readonly value = model.required<string>();

  protected readonly labelId = `color-field-${nextId++}`;

  protected pick(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.value.set(event.target.value);
    }
  }

  protected type(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const rgb = parseColor(event.target.value);
    if (rgb) {
      this.value.set(rgbToHex(rgb));
    }
    event.target.value = this.value();
  }
}
