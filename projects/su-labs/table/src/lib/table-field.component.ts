import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SuTableDraftField, SuTableInputValue } from '@su-labs/core/table';

/** The form control of one field being edited, chosen by its editor's input */
@Component({
  selector: 'su-lib-table-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'su-table-field' },
  templateUrl: './table-field.component.html',
  styleUrl: './table-field.component.scss',
})
export class SuTableFieldComponent<TRow extends object> {
  readonly field = input.required<SuTableDraftField<TRow>>();
  readonly controlId = input.required<string>();
  /** The control's name when no visible `<label>` points at it */
  readonly ariaLabel = input<string | null>(null);
  readonly mixedLabel = input.required<string>();
  readonly valueChange = output<SuTableInputValue>();

  protected readonly errorId = computed(() => `${this.controlId()}-error`);
  protected readonly placeholder = computed(() => {
    const field = this.field();
    return field.mixed ? this.mixedLabel() : (field.editor.attributes.placeholder ?? null);
  });

  protected onChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      this.valueChange.emit(target.checked);
    } else if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      this.valueChange.emit(target.value);
    }
  }
}
