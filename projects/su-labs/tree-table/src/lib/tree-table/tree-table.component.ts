import { NgTemplateOutlet } from '@angular/common';
import { afterRenderEffect, booleanAttribute, ChangeDetectionStrategy, Component, computed, contentChildren, DestroyRef, effect, ElementRef, inject, input, output, signal, TemplateRef, untracked } from '@angular/core';
import { SuTableColumnState, SuTablePageSize, SuTablePin, SuTableRowId, SuTableSort, suPinOffsets } from '@su-labs/core/table';
import { SU_TREE_TABLE_LABELS, SuTreeTableColumns, SuTreeTableController, SuTreeTableLabels, SuTreeTableNumbering, SuTreeTableRowKind, SuTreeTableRowView } from '@su-labs/core/tree-table';
import { SuTableCellContext, SuTableCellDirective, SuTablePaginatorComponent, SuTablePinDirective, SuTablePinnableChange, SuTablePinPlacement, SuTableToolbarComponent, SuTableVisibilityChange } from '@su-labs/table';
import { SuTreeTablePinIconComponent } from '../tree-table-pin-icon/tree-table-pin-icon.component';
import { SuTreeTableToggleComponent } from '../tree-table-toggle/tree-table-toggle.component';

/** A row was opened or closed */
export interface SuTreeTableToggleEvent<TRow extends object> {
  readonly row: TRow;
  readonly expanded: boolean;
  /** Every open row with children, at any level */
  readonly expandedIds: readonly SuTableRowId[];
}

/** The page on screen and how many top-level rows it shows */
export interface SuTreeTablePageEvent {
  /** From 0 */
  readonly page: number;
  readonly pageSize: SuTablePageSize;
}

let nextTreeTableId = 0;

/** The room, in pixels, the pinned columns leave for the scrolling ones before they stop sticking */
const MIN_SCROLLING_WIDTH = 96;

/** How long typing pauses, in milliseconds, before the search runs */
const SEARCH_DELAY = 200;

/**
 * An accessible tree table (`role="treegrid"`) over `SuTreeTableController` from `@su-labs/core/tree-table`: rows
 * with child rows that open and close, data or group parents, numbering, merged cells, and the table's sorting,
 * search, paging, pinned rows and columns, Columns menu and `--su-table-*` theming.
 */
@Component({
  selector: 'su-lib-tree-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    SuTablePaginatorComponent,
    SuTablePinDirective,
    SuTableToolbarComponent,
    SuTreeTablePinIconComponent,
    SuTreeTableToggleComponent,
  ],
  templateUrl: './tree-table.component.html',
  styleUrl: './tree-table.component.scss',
  host: { class: 'su-tree-table' },
})
export class SuTreeTableComponent<TRow extends object> {
  readonly columns = input.required<SuTreeTableColumns<TRow>>();
  /** The top-level rows, each with its children */
  readonly rows = input.required<readonly TRow[]>();
  /** The table's name for screen readers, shown as its caption */
  readonly caption = input.required<string>();
  /** Shows the caption on screen too @default false */
  readonly showCaption = input(false, { transform: booleanAttribute });
  /** The row's identity, e.g. the API's id; keeps open rows and pins across new rows */
  readonly rowId = input<(row: TRow) => SuTableRowId>();
  /** A row's child rows, e.g. `(item) => item.children`; a row without any is a leaf */
  readonly children =
    input<(row: TRow) => readonly TRow[] | null | undefined>();
  /** Which rows are group rows, a heading across the table over their children; every row is a data row by default */
  readonly rowKind = input<(row: TRow) => SuTreeTableRowKind>();
  /** A group row's text; by default the first column's text */
  readonly groupLabel = input<(row: TRow) => string>();
  /** The rows open to start with, or `true` for every one @default false */
  readonly expanded = input<readonly SuTableRowId[] | boolean>();
  /** A first column with each row's number @default false */
  readonly numbered = input(false, { transform: booleanAttribute });
  /** How children are numbered, for every parent or per parent: `nested` (1.1), `restart` or `continue` @default 'nested' */
  readonly numbering = input<
    SuTreeTableNumbering | ((row: TRow) => SuTreeTableNumbering)
  >();
  /** Rows left without a number, that don't count, e.g. `(row) => row.isGroup` */
  readonly unnumbered = input<(row: TRow) => boolean>();
  /** A Columns button with a menu to show or hide columns and the pin in their headings @default false */
  readonly columnControls = input(false, { transform: booleanAttribute });
  /** A search box above the table; a match keeps its parents on view @default false */
  readonly searchable = input(false, { transform: booleanAttribute });
  /** The most the table grows before it scrolls inside, any CSS length; the header and pinned rows stay in view */
  readonly maxHeight = input<string>();
  /** Extra classes for a row; the table styles `is-muted` and `is-highlighted` */
  readonly rowClass = input<(row: TRow) => string | null>();
  /** Top-level rows per page, each with its children; without it, every row shows @default 'all' */
  readonly pageSize = input<SuTablePageSize>();
  /** The page sizes people choose from under the table, e.g. `[10, 25, 'all']` */
  readonly pageSizes = input<readonly SuTablePageSize[]>([]);
  /** A Pin button on each top-level row, keeping it and its children above the others on every page @default false */
  readonly rowPinning = input(false, { transform: booleanAttribute });
  /** The ids of the top-level rows pinned to start with */
  readonly pinnedRows = input<readonly SuTableRowId[]>();
  /** Texts to replace, e.g. in the page's language */
  readonly labels = input<Partial<SuTreeTableLabels>>({});

  readonly toggled = output<SuTreeTableToggleEvent<TRow>>();
  readonly sortChange = output<SuTableSort<TRow> | null>();
  /** The search changed, after typing paused */
  readonly searchChange = output<string>();
  /** The pinned rows changed: their ids, in pin order */
  readonly pinnedRowsChange = output<readonly SuTableRowId[]>();
  /** A column was shown, hidden, pinned or unpinned: every column's state, e.g. to save it */
  readonly columnsChange = output<readonly SuTableColumnState<TRow>[]>();
  readonly pageChange = output<SuTreeTablePageEvent>();

  private readonly controller = new SuTreeTableController<TRow>();
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly cellTemplates = contentChildren(SuTableCellDirective);
  /** The row to move the focus to once it renders, after a key press */
  private readonly focusTarget = signal<SuTableRowId | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly headerWidths = signal<readonly number[]>([]);
  private readonly scrollerWidth = signal(0);
  private readonly headerHeight = signal(0);
  private readonly pinnedRowHeights = signal<readonly number[]>([]);
  private readonly headerLayout = computed(
    () =>
      `${this.state()
        .columns.map(column => `${String(column.key)}:${column.pinned}`)
        .join()}|${this.numbered()}|${this.rowPinning()}|${this.state()
        .pinnedRows.map(row => row.id)
        .join()}`
  );

  protected readonly tableId = `su-tree-table-${nextTreeTableId++}`;
  protected readonly state = signal(this.controller.state.get());
  protected readonly text = computed<SuTreeTableLabels>(() => ({
    ...SU_TREE_TABLE_LABELS,
    ...this.labels(),
  }));
  /** The pinned rows, then the current page */
  protected readonly bodyRows = computed(() => {
    const { pinnedRows, rows } = this.state();
    return [...pinnedRows, ...rows];
  });
  /** The one row in the tab order: the last one focused while it's on screen, else the first */
  protected readonly activeRowId = signal<SuTableRowId | null>(null);
  protected readonly tabRowId = computed(() => {
    const rows = this.bodyRows();
    const active = this.activeRowId();
    return rows.some(row => row.id === active) ? active : (rows[0]?.id ?? null);
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
  protected readonly columnSlot = computed(() => Number(this.numbered()));
  /**
   * Where each header slot sticks, in order: the numbers, the columns and the pin buttons. The numbers stay with
   * columns pinned to the start, the pin buttons with columns pinned to the end.
   */
  protected readonly placements = computed<
    readonly (SuTablePinPlacement | null)[]
  >(() => {
    const columns = this.state().columns;
    const numberPin: SuTablePin | null = columns.some(
      column => column.pinned === 'start'
    )
      ? 'start'
      : null;
    const actionsPin: SuTablePin | null = columns.some(
      column => column.pinned === 'end'
    )
      ? 'end'
      : null;
    return suPinOffsets(
      [
        ...(this.numbered() ? [numberPin] : []),
        ...columns.map(column => column.pinned),
        ...(this.rowPinning() ? [actionsPin] : []),
      ],
      this.headerWidths(),
      this.scrollerWidth(),
      MIN_SCROLLING_WIDTH
    );
  });
  protected readonly columnCount = computed(
    () =>
      this.state().columns.length +
      Number(this.numbered()) +
      Number(this.rowPinning())
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
        children: this.children(),
        rowKind: this.rowKind(),
        groupLabel: this.groupLabel(),
        numbering: this.numbering(),
        unnumbered: this.unnumbered(),
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
      const expanded = this.expanded();
      if (expanded !== undefined) {
        untracked(() => this.controller.configure({ expanded }));
      }
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
        if (
          widths.length !== current.length ||
          widths.some((width, index) => width !== current[index])
        ) {
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
      const id = this.focusTarget();
      this.state();
      if (id === null) {
        return;
      }
      const row = this.rowElement(id);
      if (row) {
        row.focus();
        this.focusTarget.set(null);
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

  protected rowClassOf(row: SuTreeTableRowView<TRow>): string | null {
    return this.rowClass()?.(row.data) ?? null;
  }

  protected toggle(row: SuTreeTableRowView<TRow>): void {
    this.activeRowId.set(row.id);
    this.controller.toggle(row.id);
    this.emitToggle(row);
  }

  /** Keys on the focused row itself move between rows and open or close them; keys on its buttons stay theirs */
  protected onRowKey(
    event: KeyboardEvent,
    row: SuTreeTableRowView<TRow>
  ): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    const before = row.expanded;
    const result = this.controller.rowKey(row.id, event.key);
    if (!result.handled) {
      return;
    }
    event.preventDefault();
    this.activeRowId.set(result.focusId);
    this.focusTarget.set(result.focusId);
    if (this.controller.isExpanded(row.id) !== before && before !== null) {
      this.emitToggle(row);
    }
  }

  protected onRowFocus(id: SuTableRowId): void {
    this.activeRowId.set(id);
  }

  /** The pin in a heading unpins its column, or pins it back to the side it was set up with (by default the start) */
  protected toggleColumnPin(key: keyof TRow, pinned: SuTablePin | null): void {
    const setUpPin = this.columns().find(column => column.key === key)?.pinned;
    this.controller.pinColumn(key, pinned ? null : (setUpPin ?? 'start'));
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

  protected pinRow(id: SuTableRowId): void {
    this.controller.pinRow(id);
    this.pinnedRowsChange.emit(
      this.state()
        .pinnedRows.filter(row => row.level === 1)
        .map(row => row.id)
    );
  }

  protected setPage(page: number): void {
    this.controller.setPage(page);
    this.emitPage();
  }

  protected setPageSize(pageSize: SuTablePageSize): void {
    this.controller.setPageSize(pageSize);
    this.emitPage();
  }

  private rowElement(id: SuTableRowId): HTMLElement | null {
    return (
      [
        ...this.host.nativeElement.querySelectorAll<HTMLElement>(
          'tbody > tr[data-su-tree-row]'
        ),
      ].find(row => row.dataset['suTreeRow'] === String(id)) ?? null
    );
  }

  private emitToggle(row: SuTreeTableRowView<TRow>): void {
    this.toggled.emit({
      row: row.data,
      expanded: this.controller.isExpanded(row.id),
      expandedIds: this.controller.expandedIds(),
    });
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
}
