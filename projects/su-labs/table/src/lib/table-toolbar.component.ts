import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { SuTableColumnState, SuTableLabels, SuTablePin } from '@su-labs/core/table';

/** A column was pinned or unpinned from the Columns panel */
export interface SuTablePinChange<TRow extends object> {
  readonly key: keyof TRow;
  readonly pin: SuTablePin | null;
}

/** A column was shown or hidden from the Columns panel */
export interface SuTableVisibilityChange<TRow extends object> {
  readonly key: keyof TRow;
  readonly visible: boolean;
}

/** The bar above a table: the search box and the Columns button with its panel */
@Component({
  selector: 'su-lib-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-toolbar.component.html',
  styleUrl: './table-toolbar.component.scss',
})
export class SuTableToolbarComponent<TRow extends object> {
  readonly labels = input.required<SuTableLabels>();
  /** Prefix for the ids of the controls */
  readonly controlId = input.required<string>();
  readonly searchable = input(false);
  readonly query = input('');
  readonly columnControls = input(false);
  /** The columns in the order they were set up */
  readonly columns = input<readonly SuTableColumnState<TRow>[]>([]);
  readonly queryChange = output<string>();
  readonly pinChange = output<SuTablePinChange<TRow>>();
  readonly visibilityChange = output<SuTableVisibilityChange<TRow>>();

  protected readonly columnsOpen = signal(false);

  /** The last column on view can't be hidden */
  protected readonly lastShown = computed(
    () => this.columns().filter(column => column.visible).length === 1
  );

  protected onVisible(key: keyof TRow, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.visibilityChange.emit({ key, visible: event.target.checked });
    }
  }

  protected onQuery(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.queryChange.emit(event.target.value);
    }
  }

  protected clearQuery(event: Event): void {
    if (event.target instanceof HTMLInputElement && event.target.value !== '') {
      event.preventDefault();
      event.target.value = '';
      this.queryChange.emit('');
    }
  }

  protected onPin(key: keyof TRow, event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const { value } = event.target;
      this.pinChange.emit({
        key,
        pin: value === 'start' || value === 'end' ? value : null,
      });
    }
  }
}
