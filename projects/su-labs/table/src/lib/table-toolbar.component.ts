import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { SuTableColumnState, SuTableLabels } from '@su-labs/core/table';
import { SuTablePinIconComponent } from './table-pin-icon.component';

/** A column's heading pin was shown or hidden from the Columns menu */
export interface SuTablePinnableChange<TRow extends object> {
  readonly key: keyof TRow;
  readonly pinnable: boolean;
}

/** A column was shown or hidden from the Columns menu */
export interface SuTableVisibilityChange<TRow extends object> {
  readonly key: keyof TRow;
  readonly visible: boolean;
}

/** The bar above a table: the search box, and the Columns button with its menu to show, hide and pin columns */
@Component({
  selector: 'su-lib-table-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-toolbar.component.html',
  imports: [SuTablePinIconComponent],
  styleUrl: './table-toolbar.component.scss',
  host: { '(document:pointerdown)': 'closeOutside($event)' },
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
  readonly pinnableChange = output<SuTablePinnableChange<TRow>>();
  readonly visibilityChange = output<SuTableVisibilityChange<TRow>>();
  /** Every column shown (true), or all hidden but one (false) */
  readonly allVisibilityChange = output<boolean>();

  private readonly menu = viewChild<ElementRef<HTMLElement>>('menu');
  private readonly menuButton =
    viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  protected readonly columnsOpen = signal(false);
  protected readonly columnQuery = signal('');
  /** The columns matching the menu's search */
  protected readonly listedColumns = computed(() => {
    const query = this.columnQuery().trim().toLocaleLowerCase();
    return this.columns().filter(column =>
      column.header.toLocaleLowerCase().includes(query)
    );
  });
  protected readonly shownCount = computed(
    () => this.columns().filter(column => column.visible).length
  );

  protected toggleMenu(): void {
    this.columnsOpen.update(open => !open);
    this.columnQuery.set('');
  }

  /** Escape closes the menu and puts focus back on its button */
  protected closeMenu(): void {
    this.columnsOpen.set(false);
    this.menuButton()?.nativeElement.focus();
  }

  protected closeOutside(event: PointerEvent): void {
    const menu = this.menu()?.nativeElement;
    if (menu && event.target instanceof Node && !menu.contains(event.target)) {
      this.columnsOpen.set(false);
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
      event.stopPropagation();
      event.target.value = '';
      this.queryChange.emit('');
    }
  }

  protected onColumnQuery(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.columnQuery.set(event.target.value);
    }
  }

  protected onVisible(key: keyof TRow, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.visibilityChange.emit({ key, visible: event.target.checked });
    }
  }

  protected onAllVisible(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.allVisibilityChange.emit(event.target.checked);
    }
  }

  /** The pin button shows or hides the column's pin in its heading; that pin is what pins it */
  protected togglePinnable(column: SuTableColumnState<TRow>): void {
    this.pinnableChange.emit({ key: column.key, pinnable: !column.pinnable });
  }
}
