import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

/**
 * A short code typed into a row of boxes that fill one by one, then turn green in a wave once the code is complete.
 * One real text field lies over the boxes, so typing, pasting, the phone keyboard and screen readers all work as usual.
 */
@Component({
  selector: 'su-lib-code-boxes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-boxes.component.html',
  styleUrl: './code-boxes.component.scss',
})
export class SuCodeBoxesComponent {
  readonly value = model('');
  readonly length = input.required<number>();
  readonly label = input.required<string>();
  /** The code is whole and well-formed: the boxes turn green */
  readonly complete = input(false);

  protected readonly boxes = computed(() =>
    Array.from({ length: this.length() }, (_, index) => index)
  );

  /** Capitals without spaces, never longer than the boxes */
  protected onInput(field: HTMLInputElement): void {
    const code = field.value
      .replace(/\s/g, '')
      .toUpperCase()
      .slice(0, this.length());
    field.value = code;
    this.value.set(code);
  }
}
