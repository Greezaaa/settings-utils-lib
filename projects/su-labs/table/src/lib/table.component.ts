import { NgTemplateOutlet } from '@angular/common';
import { afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChildren, DestroyRef, effect, ElementRef, inject, input, output, signal, TemplateRef, untracked } from '@angular/core';
import { SU_TABLE_LABELS, SuTableAction, SuTableActionView, SuTableColumns, SuTableColumnState, SuTableController, SuTableDraftField, suTableDropIndex, SuTableInputValue, SuTableLabels, SuTablePageSize, SuTablePin, SuTableRowId, SuTableRowView, SuTableSort } from '@su-labs/core/table';
import { SuTableCellContext, SuTableCellDirective } from './table-cell.directive';
import { SuTableFieldComponent } from './table-field.component';
import { SuTablePaginatorComponent } from './table-paginator.component';
import { SuTablePinIconComponent } from './table-pin-icon.component';
import { SuTablePinDirective, SuTablePinPlacement } from './table-pin.directive';
import { SuTablePinnableChange, SuTableToolbarComponent, SuTableVisibilityChange } from './table-toolbar.component';

/** The action id the table handles itself: it edits the row inline */
export const SU_TABLE_EDIT_ACTION = 'edit';

/** A row action (or a bulk action) was clicked */
export interface SuTableActionEvent<TRow extends object> {
  readonly id: string;
  /** The clicked row, or the selected rows for a bulk action */
  readonly rows: readonly TRow[];
}

/** The rows were reordered */
export interface SuTableReorderEvent<TRow extends object> {
  readonly ids: readonly SuTableRowId[];
  /** Every row in its new order */
  readonly rows: readonly TRow[];
}

/** The page on screen and how many rows it shows */
export interface SuTablePageEvent {
  /** From 0 */
  readonly page: number;
  readonly pageSize: SuTablePageSize;
}

/** A row being dragged with the pointer */
interface DragState {
  readonly id: SuTableRowId;
  readonly from: number;
  readonly to: number;
  /** Where the pointer went down, in page coordinates */
  readonly startY: number;
  readonly offsetY: number;
  /** The dragged row's height: how far the rows it passes slide to make room */
  readonly height: number;
  /** Every row's vertical middle before the drag, in page coordinates */
  readonly middles: readonly number[];
}

let nextTableId = 0;

/** The room, in pixels, the pinned columns leave for the scrolling ones before they stop sticking */
const MIN_SCROLLING_WIDTH = 96;

/** How long typing pauses, in milliseconds, before the search runs */
const SEARCH_DELAY = 200;

/**
 * An accessible data table over `SuTableController` from `@su-labs/core/table`: typed columns map the API's rows,
 * with sorting, selection, inline and bulk editing, drag-and-drop and keyboard reordering, row actions and announced
 * changes. Edited rows come out in the API's own shape through `edited`.
 */
@Component({
  selector: 'su-lib-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    SuTableFieldComponent,
    SuTablePaginatorComponent,
    SuTablePinDirective,
    SuTablePinIconComponent,
    SuTableToolbarComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  host: { class: 'su-table' },
})
export class SuTableComponent<TRow extends object> {
  readonly columns = input.required<SuTableColumns<TRow>>();
  readonly rows = input.required<readonly TRow[]>();
  /** The table's name for screen readers, shown as its caption */
  readonly caption = input.required<string>();
  /** Shows the caption on screen too @default false */
  readonly showCaption = input(false, { transform: booleanAttribute });
  /** The row's identity, e.g. the API's id; keeps the selection and edits across new rows */
  readonly rowId = input<(row: TRow) => SuTableRowId>();
  /** Buttons on each row; the `edit` id edits the row inline */
  readonly actions = input<readonly SuTableAction<TRow>[]>([]);
  /** Rows can be selected, to edit or act on many at once @default false */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** Rows can be reordered, by dragging or with the keyboard @default false */
  readonly reorderable = input(false, { transform: booleanAttribute });
  /** A Columns button with a menu to show or hide columns and the pin in their headings @default false */
  readonly columnControls = input(false, { transform: booleanAttribute });
  /** A search box above the table that narrows the rows by their text @default false */
  readonly searchable = input(false, { transform: booleanAttribute });
  /**
   * The most the table grows before it scrolls inside, any CSS length (e.g. `'28rem'`); the header and the pinned
   * rows stay in view while the rows scroll under them
   */
  readonly maxHeight = input<string>();
  /** A double-click on an editable cell edits its row, starting in that field @default true */
  readonly editOnDoubleClick = input(true, { transform: booleanAttribute });
  /** Rows per page; without it, every row shows @default 'all' */
  readonly pageSize = input<SuTablePageSize>();
  /** The page sizes people choose from under the table, e.g. `[10, 25, 50, 'all']` */
  readonly pageSizes = input<readonly SuTablePageSize[]>([]);
  /** A Pin button on each row, keeping it above the others on every page @default false */
  readonly rowPinning = input(false, { transform: booleanAttribute });
  /** The ids of the rows pinned to start with */
  readonly pinnedRows = input<readonly SuTableRowId[]>();
  /** Texts to replace, e.g. in the page's language */
  readonly labels = input<Partial<SuTableLabels>>({});

  /** Rows were edited and saved; send them to the API as they are */
  readonly edited = output<readonly TRow[]>();
  readonly reordered = output<SuTableReorderEvent<TRow>>();
  readonly action = output<SuTableActionEvent<TRow>>();
  readonly sortChange = output<SuTableSort<TRow> | null>();
  readonly selectionChange = output<readonly TRow[]>();
  /** The search changed, after typing paused */
  readonly searchChange = output<string>();
  /** The pinned rows changed: their ids, in pin order */
  readonly pinnedRowsChange = output<readonly SuTableRowId[]>();
  /** A column was shown, hidden, pinned or unpinned from the Columns menu: every column's state, e.g. to save it */
  readonly columnsChange = output<readonly SuTableColumnState<TRow>[]>();
  /** The page or the page size changed */
  readonly pageChange = output<SuTablePageEvent>();

  private readonly controller = new SuTableController<TRow>();
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly cellTemplates = contentChildren(SuTableCellDirective);
  private readonly focusHandleId = signal<SuTableRowId | null>(null);
  /** The id of the field to focus once it renders, after a double-click */
  private readonly focusFieldId = signal<string | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly headerWidths = signal<readonly number[]>([]);
  private readonly scrollerWidth = signal(0);
  private readonly headerLayout = computed(
    () =>
      `${this.state()
        .columns.map(column => `${String(column.key)}:${column.pinned}`)
        .join()}|${this.reorderable()}|${this.selectable()}|${this.hasActions()}|${this.state()
        .pinnedRows.map(row => row.id)
        .join()}`
  );
  private readonly headerHeight = signal(0);
  private readonly pinnedRowHeights = signal<readonly number[]>([]);

  protected readonly tableId = `su-table-${nextTableId++}`;
  protected readonly state = signal(this.controller.state.get());
  protected readonly text = computed<SuTableLabels>(() => ({
    ...SU_TABLE_LABELS,
    ...this.labels(),
  }));
  protected readonly drag = signal<DragState | null>(null);
  protected readonly inlineDraft = computed(() => {
    const draft = this.state().draft;
    return draft && !draft.bulk ? draft : null;
  });
  protected readonly bulkDraft = computed(() => {
    const draft = this.state().draft;
    return draft?.bulk ? draft : null;
  });
  /** The actions column also shows, for Save and Cancel, while a row is edited by double-click */
  protected readonly hasActions = computed(
    () =>
      this.actions().length > 0 ||
      this.rowPinning() ||
      this.inlineDraft() !== null
  );
  /** The pinned rows, then the current page */
  protected readonly bodyRows = computed(() => {
    const { pinnedRows, rows } = this.state();
    return [...pinnedRows, ...rows];
  });
  protected readonly scrolledFromStart = signal(false);
  protected readonly moreAtEnd = signal(false);
  protected readonly scrolledFromTop = signal(false);
  /** Where each pinned row sticks: under the header and the pinned rows above it */
  protected readonly pinnedRowTops = computed(() => {
    let top = this.headerHeight();
    return this.pinnedRowHeights().map(height => {
      const rowTop = top;
      top += height;
      return rowTop;
    });
  });
  protected readonly columnSlot = computed(
    () => Number(this.reorderable()) + Number(this.selectable())
  );
  /**
   * Where each header slot sticks, in order: the move handles, the checkboxes, the columns and the actions. The
   * handles and checkboxes stay with columns pinned to the start, the actions with columns pinned to the end.
   * When the pinned cells would leave too little room to scroll the rest (e.g. on a phone), nothing sticks.
   */
  protected readonly placements = computed<
    readonly (SuTablePinPlacement | null)[]
  >(() => {
    const columns = this.state().columns;
    const utilityPin: SuTablePin | null = columns.some(
      column => column.pinned === 'start'
    )
      ? 'start'
      : null;
    const actionsPin: SuTablePin | null = columns.some(
      column => column.pinned === 'end'
    )
      ? 'end'
      : null;
    const pins: readonly (SuTablePin | null)[] = [
      ...(this.reorderable() ? [utilityPin] : []),
      ...(this.selectable() ? [utilityPin] : []),
      ...columns.map(column => column.pinned),
      ...(this.hasActions() ? [actionsPin] : []),
    ];
    const widths = this.headerWidths();
    const pinnedWidth = pins.reduce(
      (sum, pin, index) => (pin ? sum + (widths[index] ?? 0) : sum),
      0
    );
    if (pinnedWidth > this.scrollerWidth() - MIN_SCROLLING_WIDTH) {
      return pins.map(() => null);
    }
    const lastStart = pins.lastIndexOf('start');
    const firstEnd = pins.indexOf('end');
    const widthOf = (pin: SuTablePin, from: number, to: number): number =>
      pins
        .slice(from, to)
        .reduce(
          (sum, slotPin, index) =>
            slotPin === pin ? sum + (widths[from + index] ?? 0) : sum,
          0
        );
    return pins.map((pin, index) =>
      pin
        ? {
            pin,
            offset:
              pin === 'start'
                ? widthOf(pin, 0, index)
                : widthOf(pin, index + 1, pins.length),
            edge: index === (pin === 'start' ? lastStart : firstEnd),
          }
        : null
    );
  });
  protected readonly columnCount = computed(
    () =>
      this.state().columns.length +
      Number(this.reorderable()) +
      Number(this.selectable()) +
      Number(this.hasActions())
  );

  constructor() {
    const unsubscribe = this.controller.state.subscribe(state =>
      this.state.set(state)
    );
    inject(DestroyRef).onDestroy(() => {
      unsubscribe();
      clearTimeout(this.searchTimer);
    });
    effect(() => {
      const options = {
        columns: this.columns(),
        rowId: this.rowId(),
        actions: this.actions(),
        labels: this.labels(),
        pageSizes: this.pageSizes(),
      };
      untracked(() => this.controller.configure(options));
    });
    effect(() => {
      const rows = this.rows();
      untracked(() => this.controller.setRows(rows));
    });
    effect(() => {
      const pinnedRows = this.pinnedRows();
      if (pinnedRows !== undefined) {
        untracked(() => this.controller.configure({ pinnedRows }));
      }
    });
    effect(() => {
      const pageSize = this.pageSize();
      if (pageSize !== undefined) {
        untracked(() => this.controller.configure({ pageSize }));
      }
    });
    afterRenderEffect(onCleanup => {
      this.headerLayout();
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const host = this.host.nativeElement;
      const scroller = host.querySelector<HTMLElement>('.su-table-scroll');
      const headers = [...host.querySelectorAll<HTMLElement>('thead th')];
      const head = host.querySelector<HTMLElement>('thead');
      const pinnedRows = [
        ...host.querySelectorAll<HTMLElement>('tbody > tr.is-pinned-row'),
      ];
      const observer = new ResizeObserver(() => {
        this.headerHeight.set(head?.getBoundingClientRect().height ?? 0);
        const heights = pinnedRows.map(
          row => row.getBoundingClientRect().height
        );
        const currentHeights = untracked(() => this.pinnedRowHeights());
        if (
          heights.length !== currentHeights.length ||
          heights.some((height, index) => height !== currentHeights[index])
        ) {
          this.pinnedRowHeights.set(heights);
        }
        const widths = headers.map(
          header => header.getBoundingClientRect().width
        );
        const current = untracked(() => this.headerWidths());
        if (widths.some((width, index) => width !== current[index])) {
          this.headerWidths.set(widths);
        }
        if (scroller) {
          this.scrollerWidth.set(scroller.clientWidth);
          this.updateScrollEdges(scroller);
        }
      });
      [...headers, ...pinnedRows].forEach(element => observer.observe(element));
      if (scroller) {
        observer.observe(scroller);
      }
      onCleanup(() => observer.disconnect());
    });
    afterRenderEffect(() => {
      const id = this.focusFieldId();
      const field = id ? document.getElementById(id) : null;
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement
      ) {
        field.focus();
        field.select();
      } else {
        field?.focus();
      }
      if (field) {
        this.focusFieldId.set(null);
      }
    });
    afterRenderEffect(() => {
      const id = this.focusHandleId();
      this.state();
      const handle = this.host.nativeElement.querySelector<HTMLElement>(
        `[data-su-handle="${id}"]`
      );
      if (id !== null && handle && document.activeElement !== handle) {
        handle.focus();
      }
    });
  }

  protected cellTemplate(
    key: keyof TRow
  ): TemplateRef<SuTableCellContext<object>> | null {
    return (
      this.cellTemplates().find(cell => cell.key() === String(key))?.template ??
      null
    );
  }

  protected inlineField(key: keyof TRow): SuTableDraftField<TRow> | null {
    return this.inlineDraft()?.fields.find(field => field.key === key) ?? null;
  }

  protected controlId(id: SuTableRowId, key: keyof TRow): string {
    return `${this.tableId}-${id}-${String(key)}`;
  }

  /** The pin in a heading pins its column to the start, or unpins it */
  protected toggleColumnPin(key: keyof TRow, pinned: SuTablePin | null): void {
    this.controller.pinColumn(key, pinned ? null : 'start');
    this.columnsChange.emit(this.state().allColumns);
  }

  protected setColumnPinnable({
    key,
    pinnable,
  }: SuTablePinnableChange<TRow>): void {
    this.controller.setColumnPinnable(key, pinnable);
    this.columnsChange.emit(this.state().allColumns);
  }

  protected setColumnsVisible(visible: boolean): void {
    this.controller.setColumnsVisible(visible);
    this.columnsChange.emit(this.state().allColumns);
  }

  protected setColumnVisible({
    key,
    visible,
  }: SuTableVisibilityChange<TRow>): void {
    this.controller.setColumnVisible(key, visible);
    this.columnsChange.emit(this.state().allColumns);
  }

  /** Narrows the rows once typing pauses, so each keystroke isn't announced */
  protected search(query: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.controller.search(query);
      this.searchChange.emit(query);
    }, SEARCH_DELAY);
  }

  protected onScroll(event: Event): void {
    if (event.target instanceof HTMLElement) {
      this.updateScrollEdges(event.target);
    }
  }

  protected sortBy(key: keyof TRow): void {
    this.controller.sortBy(key);
    this.sortChange.emit(this.state().sort);
  }

  protected select(id: SuTableRowId): void {
    this.controller.select(id);
    this.selectionChange.emit(this.controller.selectedRows());
  }

  protected selectAll(selected?: boolean): void {
    this.controller.selectAll(selected);
    this.selectionChange.emit(this.controller.selectedRows());
  }

  protected pinRow(id: SuTableRowId): void {
    this.controller.pinRow(id);
    this.pinnedRowsChange.emit(this.state().pinnedRows.map(row => row.id));
  }

  protected runAction(
    action: SuTableActionView,
    row: SuTableRowView<TRow>
  ): void {
    if (action.id === SU_TABLE_EDIT_ACTION && this.state().editable) {
      this.controller.startEdit([row.id]);
      return;
    }
    this.action.emit({ id: action.id, rows: [row.data] });
  }

  protected runBulkAction(action: SuTableActionView): void {
    this.action.emit({ id: action.id, rows: this.controller.selectedRows() });
  }

  protected setPage(page: number): void {
    this.controller.setPage(page);
    this.emitPage();
  }

  protected setPageSize(pageSize: SuTablePageSize): void {
    this.controller.setPageSize(pageSize);
    this.emitPage();
  }

  /** Whether a double-click on this cell edits its row */
  protected editsOnDoubleClick(key: keyof TRow): boolean {
    return (
      this.editOnDoubleClick() &&
      this.state().columns.some(column => column.key === key && column.editor)
    );
  }

  /**
   * Edits the row of a double-clicked cell, starting in its field. While another row (or several) is being edited,
   * only a cell of that same row moves the focus, so unsaved changes are never dropped.
   */
  protected editCell(row: SuTableRowView<TRow>, key: keyof TRow): void {
    if (!this.editsOnDoubleClick(key)) {
      return;
    }
    const draft = this.state().draft;
    if (!draft) {
      this.controller.startEdit([row.id]);
    } else if (draft.bulk || draft.ids[0] !== row.id) {
      return;
    }
    this.focusFieldId.set(this.controlId(row.id, key));
  }

  /** The second click of a double-click doesn't select the word under it */
  protected keepTextUnselected(event: MouseEvent, key: keyof TRow): void {
    if (event.detail > 1 && this.editsOnDoubleClick(key)) {
      event.preventDefault();
    }
  }

  protected editSelected(): void {
    this.controller.startEdit();
  }

  protected setDraft(key: keyof TRow, value: SuTableInputValue): void {
    this.controller.setDraft(key, value);
  }

  protected save(event?: Event): void {
    event?.preventDefault();
    const result = this.controller.save();
    if (result.ok && result.rows.length > 0) {
      this.edited.emit(result.rows);
    }
  }

  protected cancelEdit(): void {
    this.controller.cancelEdit();
  }

  /** Enter saves the row being edited inline (but adds a line in a text area), Escape cancels */
  protected onEditKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelEdit();
    } else if (
      event.key === 'Enter' &&
      !(event.target instanceof HTMLTextAreaElement)
    ) {
      this.save(event);
    }
  }

  protected onHandleKey(event: KeyboardEvent, id: SuTableRowId): void {
    const result = this.controller.moveKey(id, event.key);
    if (!result.handled) {
      this.focusHandleId.set(null);
      return;
    }
    event.preventDefault();
    this.focusHandleId.set(id);
    if (result.order) {
      this.emitReorder(result.order);
    }
  }

  protected onHandleDown(
    event: PointerEvent,
    id: SuTableRowId,
    index: number
  ): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (event.target instanceof Element) {
      event.target.setPointerCapture(event.pointerId);
    }
    const rows = [
      ...this.host.nativeElement.querySelectorAll('tbody > tr[data-su-row]'),
    ].map(row => row.getBoundingClientRect());
    this.drag.set({
      id,
      from: index,
      to: index,
      startY: event.clientY + window.scrollY,
      offsetY: 0,
      height: rows[index]?.height ?? 0,
      middles: rows.map(({ top, height }) => top + window.scrollY + height / 2),
    });
  }

  protected onHandleMove(event: PointerEvent): void {
    const drag = this.drag();
    if (!drag) {
      return;
    }
    const pointerY = event.clientY + window.scrollY;
    this.drag.set({
      ...drag,
      to: suTableDropIndex(pointerY, drag.middles, drag.from),
      offsetY: pointerY - drag.startY,
    });
  }

  protected onHandleUp(): void {
    const drag = this.drag();
    this.drag.set(null);
    const order = drag ? this.controller.move(drag.id, drag.to) : null;
    if (order) {
      this.emitReorder(order);
    }
  }

  protected onHandleCancel(): void {
    this.drag.set(null);
  }

  /** While dragging, the dragged row follows the pointer and the rows it passes slide aside to open its place */
  protected dragTransform(index: number): string | null {
    const drag = this.drag();
    if (!drag) {
      return null;
    }
    if (index === drag.from) {
      return `translateY(${drag.offsetY}px)`;
    }
    const slidesUp = index > drag.from && index <= drag.to;
    const slidesDown = index < drag.from && index >= drag.to;
    return slidesUp || slidesDown
      ? `translateY(${slidesUp ? -drag.height : drag.height}px)`
      : null;
  }

  /** Shadows show on the pinned edges only while columns or rows are scrolled under them */
  private updateScrollEdges(scroller: HTMLElement): void {
    this.scrolledFromTop.set(scroller.scrollTop > 1);
    const position = Math.abs(scroller.scrollLeft);
    this.scrolledFromStart.set(position > 1);
    this.moreAtEnd.set(
      position < scroller.scrollWidth - scroller.clientWidth - 1
    );
  }

  private emitPage(): void {
    const { page, pageSize } = this.state().pagination;
    this.pageChange.emit({ page, pageSize });
  }

  private emitReorder(ids: readonly SuTableRowId[]): void {
    this.reordered.emit({ ids, rows: this.controller.rowsOf(ids) });
  }
}
