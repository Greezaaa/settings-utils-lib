import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

let nextFieldId = 0;

@Component({
  selector: 'app-floating-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-field.html',
  styleUrl: './floating-field.scss',
})
export class FloatingField {
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly value = model('');

  protected readonly fieldId = `floating-field-${nextFieldId++}`;

  protected update(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.value.set(event.target.value);
    }
  }
}
