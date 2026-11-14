import { createSuStore, SuReadableStore } from '@su-labs/core';
import { SU_TABLE_LABELS } from './table.labels';
import { SuTableAction, SuTableActionView, SuTableColumn, SuTableColumns, SuTableColumnView, SuTableDraft, SuTableEditorView, SuTableInputValue, SuTableLabels, SuTableMoveKeyResult, SuTableOptions, SuTablePageSize, SuTablePin, SuTableRowId, SuTableRowView, SuTableSaveResult, SuTableSort, SuTableState } from './table.types';

/** A column with its field mapping turned into functions of the whole row */
interface ResolvedColumn<TRow extends object> {
  readonly key: keyof TRow;
  readonly view: Omit<SuTableColumnView<TRow>, 'sort'>;
  readonly compare: ((a: TRow, b: TRow) => number) | null;
  text(row: TRow): string;
  toInput(row: TRow): SuTableInputValue;
  apply(
    row: TRow,
    input: SuTableInputValue
  ): { readonly row: TRow; readonly error: string | null };
}

/** The rows being edited and what has been typed so far */
interface DraftState<TRow extends object> {
  readonly ids: readonly SuTableRowId[];
  readonly values: Map<keyof TRow, SuTableInputValue>;
  readonly mixed: Set<keyof TRow>;
  readonly changed: Set<keyof TRow>;
  readonly errors: Map<keyof TRow, string>;
}

/** A row picked up with the keyboard, and the order to go back to on Escape */
interface GrabState<TRow extends object> {
  readonly id: SuTableRowId;
  readonly original: readonly TRow[];
}

const isEmpty = (value: unknown): boolean =>
  value === null || value === undefined || value === '';

/** Compares two field values: numbers, booleans and dates by value, anything else as text; empty values last */
export function suCompareValues(a: unknown, b: unknown): number {
  if (isEmpty(a) || isEmpty(b)) {
    return Number(isEmpty(a)) - Number(isEmpty(b));
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

/**
 * Where a dragged row lands: the number of other rows whose middle is above the pointer.
 * @param pointerY The pointer's vertical position
 * @param rowMiddles The vertical middle of every row, in display order, the dragged one included
 * @param fromIndex The dragged row's position
 */
export function suTableDropIndex(
  pointerY: number,
  rowMiddles: readonly number[],
  fromIndex: number
): number {
  return rowMiddles.filter(
    (middle, index) => index !== fromIndex && middle < pointerY
  ).length;
}

function defaultText(value: unknown, labels: SuTableLabels): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? labels.yes : labels.no;
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function resolveColumn<TRow extends object, TKey extends keyof TRow>(
  column: SuTableColumn<TRow, TKey>,
  labels: SuTableLabels
): ResolvedColumn<TRow> {
  const { key, edit, sortable = false } = column;
  const compareValues =
    typeof sortable === 'function' ? sortable : suCompareValues;
  const editor: SuTableEditorView | null = edit
    ? {
        input: edit.input,
        options: edit.options ?? [],
        attributes: edit.attributes ?? {},
      }
    : null;
  return {
    key,
    view: {
      key,
      header: column.header,
      align: column.align ?? 'start',
      pinned: column.pinned ?? null,
      sortable: sortable !== false,
      editor,
    },
    compare:
      sortable === false ? null : (a, b) => compareValues(a[key], b[key]),
    text: row =>
      column.format
        ? column.format(row[key], row)
        : defaultText(row[key], labels),
    toInput: row => (edit ? edit.toInput(row[key]) : ''),
    apply: (row, input) => {
      if (!edit) {
        return { row, error: null };
      }
      const value = edit.parse(input);
      const error =
        edit.validate?.(value) ?? column.validate?.(value, row) ?? null;
      return { row: { ...row, [key]: value }, error };
    },
  };
}

function normalizePageSize(pageSize: SuTablePageSize): SuTablePageSize {
  return pageSize === 'all' ? pageSize : Math.max(1, Math.floor(pageSize));
}

function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}

/**
 * Framework-agnostic data table: maps API rows to columns, and keeps their sorting, selection, order and editing in
 * one reactive `state` store. Edited rows come back in the API's own shape. Rendering is left to the app, or to a
 * framework package such as `@su-labs/table` for Angular.
 * @typeParam TRow The row as the API sends it
 */
export class SuTableController<TRow extends object> {
  private columns: readonly ResolvedColumn<TRow>[] = [];
  private actions: readonly SuTableAction<TRow>[] = [];
  private labels: SuTableLabels = SU_TABLE_LABELS;
  private rowIdOf: ((row: TRow) => SuTableRowId) | null = null;
  private readonly autoIds = new WeakMap<TRow, number>();
  private nextAutoId = 1;
  private order: readonly TRow[] = [];
  private sort: SuTableSort<TRow> | null = null;
  private readonly selected = new Set<SuTableRowId>();
  private draft: DraftState<TRow> | null = null;
  private grabbed: GrabState<TRow> | null = null;
  private announcement = '';
  private columnOptions: SuTableColumns<TRow> = [];
  private readonly pins = new Map<keyof TRow, SuTablePin | null>();
  private pinnedIds: readonly SuTableRowId[] = [];
  private pageSize: SuTablePageSize = 'all';
  private pageSizes: readonly SuTablePageSize[] = [];
  private page = 0;
  private readonly store = createSuStore<SuTableState<TRow>>(this.build());

  /** Everything needed to render the table */
  readonly state: SuReadableStore<SuTableState<TRow>> = this.store.asReadonly();

  constructor(
    options: SuTableOptions<TRow> & { readonly rows?: readonly TRow[] } = {}
  ) {
    this.configure(options);
    if (options.rows) {
      this.setRows(options.rows);
    }
  }

  /** Changes the columns, row identity, actions, labels or paging */
  configure(options: SuTableOptions<TRow>): void {
    this.labels = { ...this.labels, ...options.labels };
    this.columnOptions = options.columns ?? this.columnOptions;
    this.columns = this.columnOptions.map(column =>
      resolveColumn(column, this.labels)
    );
    this.actions = options.actions ?? this.actions;
    this.rowIdOf = options.rowId ?? this.rowIdOf;
    this.pageSizes = options.pageSizes ?? this.pageSizes;
    this.pinnedIds = options.pinnedRows ?? this.pinnedIds;
    if (options.pageSize !== undefined) {
      this.pageSize = normalizePageSize(options.pageSize);
      this.page = 0;
    }
    this.publish();
  }

  /** Replaces the rows, e.g. with the API's response; the selection keeps the rows that are still there */
  setRows(rows: readonly TRow[]): void {
    this.order = [...rows];
    const ids = new Set(rows.map(row => this.idOf(row)));
    [...this.selected]
      .filter(id => !ids.has(id))
      .forEach(id => this.selected.delete(id));
    this.pinnedIds = this.pinnedIds.filter(id => ids.has(id));
    if (this.draft?.ids.some(id => !ids.has(id))) {
      this.draft = null;
    }
    this.grabbed = null;
    this.page = this.pageBounds().page;
    this.publish();
  }

  /** A row's identity */
  idOf(row: TRow): SuTableRowId {
    if (this.rowIdOf) {
      return this.rowIdOf(row);
    }
    const id = this.autoIds.get(row) ?? this.nextAutoId++;
    this.autoIds.set(row, id);
    return id;
  }

  /** The rows with these ids, in display order */
  rowsOf(ids: readonly SuTableRowId[]): TRow[] {
    const wanted = new Set(ids);
    return this.displayed().filter(row => wanted.has(this.idOf(row)));
  }

  /** The selected rows, in display order */
  selectedRows(): TRow[] {
    return this.rowsOf([...this.selected]);
  }

  /** Sorts by a column: ascending, then descending, then back to the rows' own order */
  sortBy(key: keyof TRow): void {
    const column = this.columns.find(item => item.key === key);
    if (!column?.compare) {
      return;
    }
    const direction = this.sort?.key === key ? this.sort.direction : null;
    if (direction === 'descending') {
      this.sort = null;
      this.page = 0;
      this.announcement = this.labels.sortCleared;
    } else {
      const next = direction === 'ascending' ? 'descending' : 'ascending';
      this.sort = { key, direction: next };
      this.page = 0;
      const header = column.view.header;
      const { sortedAscending, sortedDescending } = this.labels;
      this.announcement =
        next === 'ascending'
          ? sortedAscending(header)
          : sortedDescending(header);
    }
    this.publish();
  }

  /** Selects or deselects one row; without `selected`, toggles it */
  select(id: SuTableRowId, selected = !this.selected.has(id)): void {
    if (selected) {
      this.selected.add(id);
    } else {
      this.selected.delete(id);
    }
    this.announceSelection();
  }

  /**
   * Selects or deselects the rows on screen (the pinned ones and the current page); without `selected`, selects them
   * unless all are selected
   */
  selectAll(selected?: boolean): void {
    const ids = [...this.pinnedRows(), ...this.pageRows()].map(row =>
      this.idOf(row)
    );
    const select = selected ?? ids.some(id => !this.selected.has(id));
    ids.forEach(id =>
      select ? this.selected.add(id) : this.selected.delete(id)
    );
    this.announceSelection();
  }

  /** Deselects every row, on every page */
  clearSelection(): void {
    this.selected.clear();
    this.announceSelection();
  }

  /** Shows a page, from 0; kept within the pages there are */
  setPage(page: number): void {
    const { count } = this.pageBounds();
    const next = Math.max(0, Math.min(Math.floor(page), count - 1));
    if (next === this.page) {
      return;
    }
    this.page = next;
    this.announcement = this.labels.page(next + 1, count);
    this.publish();
  }

  /** Changes how many rows a page shows, keeping the first row on screen in view */
  setPageSize(pageSize: SuTablePageSize): void {
    const { start } = this.pageBounds();
    this.pageSize = normalizePageSize(pageSize);
    this.page = this.pageSize === 'all' ? 0 : Math.floor(start / this.pageSize);
    const { page, count } = this.pageBounds();
    this.announcement = this.labels.page(page + 1, count);
    this.publish();
  }

  /**
   * Moves a row to a position on the current page, e.g. on a drop. A sorted table keeps its sorted order as the new
   * order. Pinned rows don't move.
   * @returns The ids in their new order, or null when nothing moved
   */
  move(id: SuTableRowId, toIndex: number): readonly SuTableRowId[] | null {
    const base = this.displayed();
    const rows = this.unpinned(base);
    const { start, end } = this.pageBounds(rows.length);
    const from = rows.findIndex(row => this.idOf(row) === id);
    const to = Math.max(start, Math.min(start + toIndex, end - 1));
    if (from === -1 || from === to) {
      return null;
    }
    this.sort = null;
    this.order = this.withUnpinned(base, moveItem(rows, from, to));
    this.announcement = this.labels.dropped(to + 1, rows.length);
    this.publish();
    return this.ids();
  }

  /** Picks a row up to move it with the keyboard; pinned rows can't be moved */
  grab(id: SuTableRowId): void {
    const base = this.displayed();
    const index = this.unpinned(base).findIndex(row => this.idOf(row) === id);
    if (index === -1) {
      return;
    }
    this.sort = null;
    this.order = base;
    this.grabbed = { id, original: base };
    this.announcement = this.labels.grabbed(
      index + 1,
      this.unpinned(base).length
    );
    this.publish();
  }

  /** Moves the picked-up row by a number of places */
  moveGrabbed(offset: number): void {
    const grabbed = this.grabbed;
    if (!grabbed) {
      return;
    }
    const rows = this.unpinned(this.order);
    const from = rows.findIndex(row => this.idOf(row) === grabbed.id);
    const to = Math.max(0, Math.min(from + offset, rows.length - 1));
    this.order = this.withUnpinned(this.order, moveItem(rows, from, to));
    this.followRow(to);
    this.announcement = this.labels.moved(to + 1, rows.length);
    this.publish();
  }

  /**
   * Drops the picked-up row where it is.
   * @returns The ids in their new order, or null when nothing moved
   */
  drop(): readonly SuTableRowId[] | null {
    const grabbed = this.grabbed;
    if (!grabbed) {
      return null;
    }
    this.grabbed = null;
    const rows = this.unpinned(this.order);
    const position = rows.findIndex(row => this.idOf(row) === grabbed.id) + 1;
    this.announcement = this.labels.dropped(position, rows.length);
    this.publish();
    const unchanged = this.order.every(
      (row, index) => row === grabbed.original[index]
    );
    return unchanged ? null : this.ids();
  }

  /** Puts the picked-up row back where it was */
  cancelMove(): void {
    if (!this.grabbed) {
      return;
    }
    const { id, original } = this.grabbed;
    this.order = original;
    this.grabbed = null;
    this.followRow(
      this.unpinned(original).findIndex(row => this.idOf(row) === id)
    );
    this.announcement = this.labels.moveCancelled;
    this.publish();
  }

  /** Pins a row above the others, on every page, or unpins it; without `pinned`, toggles it */
  pinRow(id: SuTableRowId, pinned = !this.pinnedIds.includes(id)): void {
    const row = this.order.find(item => this.idOf(item) === id);
    if (!row || this.pinnedIds.includes(id) === pinned) {
      return;
    }
    this.cancelMove();
    this.pinnedIds = pinned
      ? [...this.pinnedIds, id]
      : this.pinnedIds.filter(item => item !== id);
    this.page = this.pageBounds().page;
    const label = this.rowLabel(row, id);
    this.announcement = pinned
      ? this.labels.rowPinned(label)
      : this.labels.rowUnpinned(label);
    this.publish();
  }

  /**
   * Handles a key on a row's move handle: Space or Enter picks the row up and drops it, the up and down arrows move
   * it, Home and End send it to the top or bottom, and Escape (or Tab, leaving the handle) puts it back.
   * @returns Whether the key was handled (to prevent its default) and, after a drop, the new order
   */
  moveKey(id: SuTableRowId, key: string): SuTableMoveKeyResult {
    const isToggle = key === ' ' || key === 'Enter';
    if (this.grabbed?.id !== id) {
      if (isToggle) {
        this.grab(id);
      }
      return isToggle ? { handled: true, order: null } : { handled: false };
    }
    const offsets: Readonly<Record<string, number>> = {
      ArrowUp: -1,
      ArrowDown: 1,
      Home: -this.order.length,
      End: this.order.length,
    };
    if (key in offsets) {
      this.moveGrabbed(offsets[key]);
    } else if (isToggle) {
      return { handled: true, order: this.drop() };
    } else if (key === 'Escape') {
      this.cancelMove();
    } else if (key === 'Tab') {
      this.cancelMove();
      return { handled: false };
    } else {
      return { handled: false };
    }
    return { handled: true, order: null };
  }

  /** Pins a column to an edge, keeping it in view while the others scroll, or unpins it with null */
  pinColumn(key: keyof TRow, pin: SuTablePin | null): void {
    const column = this.columns.find(item => item.key === key);
    if (!column || this.pinOf(column) === pin) {
      return;
    }
    this.pins.set(key, pin);
    const { header } = column.view;
    this.announcement = pin
      ? this.labels.columnPinned(header, pin)
      : this.labels.columnUnpinned(header);
    this.publish();
  }

  /** Starts editing rows: one row edits every field, many rows apply only the fields that change to all of them */
  startEdit(ids: readonly SuTableRowId[] = [...this.selected]): void {
    const rows = this.rowsOf(ids);
    const editable = this.columns.filter(column => column.view.editor);
    if (rows.length === 0 || editable.length === 0) {
      return;
    }
    const draft: DraftState<TRow> = {
      ids: rows.map(row => this.idOf(row)),
      values: new Map(),
      mixed: new Set(),
      changed: new Set(),
      errors: new Map(),
    };
    editable.forEach(column => {
      const [first, ...rest] = rows.map(row => column.toInput(row));
      const mixed = rest.some(value => value !== first);
      if (mixed) {
        draft.mixed.add(column.key);
      }
      draft.values.set(
        column.key,
        mixed ? (typeof first === 'boolean' ? false : '') : first
      );
    });
    this.draft = draft;
    this.announcement = this.labels.editing(rows.length);
    this.publish();
  }

  /** Sets a field's value as typed in its control */
  setDraft(key: keyof TRow, value: SuTableInputValue): void {
    if (!this.draft?.values.has(key)) {
      return;
    }
    this.draft.values.set(key, value);
    this.draft.changed.add(key);
    this.draft.mixed.delete(key);
    this.draft.errors.delete(key);
    this.publish();
  }

  /**
   * Checks and applies the changed fields.
   * @returns The edited rows in the API's shape (none when nothing changed), or how many fields need fixing
   */
  save(): SuTableSaveResult<TRow> {
    const draft = this.draft;
    if (!draft) {
      return { ok: true, rows: [] };
    }
    draft.errors.clear();
    const changed = this.columns.filter(column =>
      draft.changed.has(column.key)
    );
    const edits = new Map<TRow, TRow>();
    this.rowsOf(draft.ids).forEach(original => {
      const edited = changed.reduce((row, column) => {
        const { row: next, error } = column.apply(
          row,
          draft.values.get(column.key) ?? ''
        );
        if (error && !draft.errors.has(column.key)) {
          draft.errors.set(column.key, error);
        }
        return next;
      }, original);
      edits.set(original, edited);
    });
    if (draft.errors.size > 0) {
      this.announcement = this.labels.invalid(draft.errors.size);
      this.publish();
      return { ok: false, errors: draft.errors.size };
    }
    const rows = changed.length === 0 ? [] : [...edits.values()];
    if (!this.rowIdOf) {
      edits.forEach((edited, original) =>
        this.autoIds.set(edited, Number(this.idOf(original)))
      );
    }
    this.order = this.order.map(row => edits.get(row) ?? row);
    this.draft = null;
    this.announcement = this.labels.saved(rows.length);
    this.publish();
    return { ok: true, rows };
  }

  /** Stops editing without saving */
  cancelEdit(): void {
    if (!this.draft) {
      return;
    }
    this.draft = null;
    this.announcement = this.labels.editCancelled;
    this.publish();
  }

  private ids(): readonly SuTableRowId[] {
    return this.order.map(row => this.idOf(row));
  }

  private displayed(): readonly TRow[] {
    const sort = this.sort;
    const compare = this.columns.find(
      column => column.key === sort?.key
    )?.compare;
    if (!sort || !compare) {
      return this.order;
    }
    const factor = sort.direction === 'ascending' ? 1 : -1;
    return [...this.order].sort((a, b) => factor * compare(a, b));
  }

  private announceSelection(): void {
    this.announcement = this.labels.selected(this.selected.size);
    this.publish();
  }

  /** Turns to the page that holds the row at this position */
  private followRow(index: number): void {
    if (this.pageSize !== 'all') {
      this.page = Math.floor(index / this.pageSize);
    }
  }

  private isPinned(row: TRow): boolean {
    return this.pinnedIds.includes(this.idOf(row));
  }

  private unpinned(rows: readonly TRow[]): readonly TRow[] {
    return rows.filter(row => !this.isPinned(row));
  }

  /** The base rows with their unpinned ones replaced, in order, by `rows`; pinned rows keep their places */
  private withUnpinned(
    base: readonly TRow[],
    rows: readonly TRow[]
  ): readonly TRow[] {
    let next = 0;
    return base.map(row => (this.isPinned(row) ? row : rows[next++]));
  }

  /** The pinned rows, in the order they were pinned */
  private pinnedRows(): readonly TRow[] {
    return this.pinnedIds.flatMap(id => {
      const row = this.order.find(item => this.idOf(item) === id);
      return row ? [row] : [];
    });
  }

  private rowLabel(row: TRow, id: SuTableRowId): string {
    return this.columns[0]?.text(row) || String(id);
  }

  private pageBounds(total = this.unpinned(this.order).length): {
    readonly page: number;
    readonly count: number;
    readonly start: number;
    readonly end: number;
  } {
    const size = this.pageSize === 'all' ? Math.max(total, 1) : this.pageSize;
    const count = Math.max(1, Math.ceil(total / size));
    const page = Math.min(this.page, count - 1);
    const start = page * size;
    return { page, count, start, end: Math.min(start + size, total) };
  }

  private pageRows(): readonly TRow[] {
    const rows = this.unpinned(this.displayed());
    const { start, end } = this.pageBounds(rows.length);
    return rows.slice(start, end);
  }

  private pinOf(column: ResolvedColumn<TRow>): SuTablePin | null {
    return this.pins.has(column.key)
      ? (this.pins.get(column.key) ?? null)
      : column.view.pinned;
  }

  /** The columns in display order: pinned to the start, the rest, then pinned to the end */
  private displayColumns(): readonly ResolvedColumn<TRow>[] {
    const rank = (column: ResolvedColumn<TRow>): number => {
      const pin = this.pinOf(column);
      return pin === 'start' ? 0 : pin === 'end' ? 2 : 1;
    };
    return [...this.columns].sort((a, b) => rank(a) - rank(b));
  }

  private publish(): void {
    this.store.set(this.build());
  }

  private build(): SuTableState<TRow> {
    const columns = this.displayColumns();
    const all = this.displayed();
    const unpinned = this.unpinned(all);
    const { page, count, start, end } = this.pageBounds(unpinned.length);
    const rows = unpinned
      .slice(start, end)
      .map(row => this.rowView(row, columns));
    const pinnedRows = this.pinnedRows().map(row => this.rowView(row, columns));
    const onScreen = [...pinnedRows, ...rows];
    const selectedCount = onScreen.filter(row => row.selected).length;
    return {
      columns: columns.map(column => ({
        ...column.view,
        pinned: this.pinOf(column),
        sort: this.sort?.key === column.key ? this.sort.direction : 'none',
      })),
      rows,
      pinnedRows,
      rowHeaderKey: this.columns[0]?.key ?? null,
      sort: this.sort,
      selectedIds: all
        .map(row => this.idOf(row))
        .filter(id => this.selected.has(id)),
      selection:
        selectedCount === 0
          ? 'none'
          : selectedCount === onScreen.length
            ? 'all'
            : 'some',
      pagination: {
        page,
        pageCount: count,
        pageSize: this.pageSize,
        pageSizes: this.pageSizes,
        totalRows: unpinned.length,
        rangeStart: unpinned.length > 0 ? start + 1 : 0,
        rangeEnd: end,
      },
      bulkActions: this.actions
        .filter(action => action.bulk)
        .map(action => ({
          id: action.id,
          label: action.label,
          danger: action.danger ?? false,
          disabled: false,
        })),
      editable: columns.some(column => column.view.editor),
      draft: this.draftView(),
      grabbedId: this.grabbed?.id ?? null,
      announcement: this.announcement,
    };
  }

  private rowView(
    row: TRow,
    columns: readonly ResolvedColumn<TRow>[]
  ): SuTableRowView<TRow> {
    const id = this.idOf(row);
    const cells = columns.map(column => ({
      key: column.key,
      text: column.text(row),
    }));
    const actions: SuTableActionView[] = this.actions
      .filter(action => !action.hidden?.(row))
      .map(action => ({
        id: action.id,
        label: action.label,
        danger: action.danger ?? false,
        disabled: action.disabled?.(row) ?? false,
      }));
    return {
      id,
      data: row,
      label: this.rowLabel(row, id),
      cells,
      selected: this.selected.has(id),
      pinned: this.pinnedIds.includes(id),
      actions,
    };
  }

  private draftView(): SuTableDraft<TRow> | null {
    const draft = this.draft;
    if (!draft) {
      return null;
    }
    const fields = this.displayColumns().flatMap(({ key, view }) =>
      view.editor
        ? [
            {
              key,
              header: view.header,
              editor: view.editor,
              value: draft.values.get(key) ?? '',
              mixed: draft.mixed.has(key),
              changed: draft.changed.has(key),
              error: draft.errors.get(key) ?? null,
            },
          ]
        : []
    );
    return { ids: draft.ids, bulk: draft.ids.length > 1, fields };
  }
}
