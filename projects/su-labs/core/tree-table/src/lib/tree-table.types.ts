import { SuTableColumn, SuTableColumnState, SuTableColumnView, SuTableLabels, SuTablePageSize, SuTablePagination, SuTableRowId, SuTableSort } from '@su-labs/core/table';

/** A data row has cells (and may have children); a group row is a heading across the table, over its children */
export type SuTreeTableRowKind = 'data' | 'group';

/**
 * How a parent's children are numbered: `nested` under the parent's number (1.1, 1.2), `restart` from 1 again, or
 * `continue` the parent's own count through them (parent 1, children 2 and 3, next row 4)
 */
export type SuTreeTableNumbering = 'nested' | 'restart' | 'continue';

/** How many cells one cell takes: rows below it and columns after it, itself included */
export interface SuTreeTableSpan {
  /** @default 1 */
  readonly rows?: number;
  /** @default 1 */
  readonly columns?: number;
}

/**
 * Maps one field of the API row to a column, like a table column without editing.
 * @typeParam TRow The row as the API sends it
 * @typeParam TKey The field this column shows
 */
export interface SuTreeTableColumn<
  TRow extends object,
  TKey extends keyof TRow,
> extends Omit<SuTableColumn<TRow, TKey>, 'edit' | 'validate'> {
  /**
   * Merges the cell with the cells below it (`rows`) and after it (`columns`), e.g. one category over several rows.
   * A row span stops at a group row, at the end of its parent's rows and at the end of the page; a column span stays
   * within the column's pinned side. The first column holds the tree's toggles, so it is never merged down
   */
  span?(value: TRow[TKey], row: TRow): SuTreeTableSpan | null;
}

/** Every column of a tree table, each typed by its own field */
export type SuTreeTableColumns<TRow extends object> = readonly {
  [TKey in keyof TRow]-?: SuTreeTableColumn<TRow, TKey>;
}[keyof TRow][];

/** Texts the tree table announces and shows: the table's, and the tree's own */
export interface SuTreeTableLabels extends SuTableLabels {
  readonly expandRow: (rowLabel: string) => string;
  readonly collapseRow: (rowLabel: string) => string;
  /** Heading of the numbers' column */
  readonly number: string;
}

/** What the tree table is set up with; `configure` changes any of it later */
export interface SuTreeTableOptions<TRow extends object> {
  readonly columns?: SuTreeTableColumns<TRow>;
  /** The row's identity; by default each row object gets its own, so pass the API's id to keep state across `setRows` */
  readonly rowId?: (row: TRow) => SuTableRowId;
  /** A row's child rows; a row without any is a leaf */
  readonly children?: (row: TRow) => readonly TRow[] | null | undefined;
  /** Which rows are group rows, a heading across the table; every row is a data row by default */
  readonly rowKind?: (row: TRow) => SuTreeTableRowKind;
  /** A group row's text; by default the first column's text */
  readonly groupLabel?: (row: TRow) => string;
  /** The rows open to start with, or `true` for every one @default false */
  readonly expanded?: readonly SuTableRowId[] | boolean;
  /** How children are numbered, for every parent or per parent @default 'nested' */
  readonly numbering?:
    | SuTreeTableNumbering
    | ((row: TRow) => SuTreeTableNumbering);
  /** Rows left without a number, that don't count, e.g. group rows */
  readonly unnumbered?: (row: TRow) => boolean;
  /** Any texts to replace, see `SU_TREE_TABLE_LABELS` */
  readonly labels?: Partial<SuTreeTableLabels>;
  /** Top-level rows per page, each with its children; `setPageSize` changes it later @default 'all' */
  readonly pageSize?: SuTablePageSize;
  /** The page sizes to choose from, e.g. `[10, 25, 'all']`; none by default */
  readonly pageSizes?: readonly SuTablePageSize[];
  /** The ids of the top-level rows pinned above the others, with their children; `pinRow` changes them later */
  readonly pinnedRows?: readonly SuTableRowId[];
}

/** A column, ready to render */
export type SuTreeTableColumnView<TRow extends object> = Omit<
  SuTableColumnView<TRow>,
  'editor'
>;

/** One cell to render; the cells a span covers are left out */
export interface SuTreeTableCell<TRow extends object> {
  readonly key: keyof TRow;
  /** Its column's place among `columns` */
  readonly columnIndex: number;
  readonly text: string;
  readonly rowSpan: number;
  readonly colSpan: number;
}

/** A row on screen, ready to render */
export interface SuTreeTableRowView<TRow extends object> {
  readonly id: SuTableRowId;
  /** The row as the API sent it */
  readonly data: TRow;
  readonly kind: SuTreeTableRowKind;
  /** The group's text, or the first column's text, to name the row in labels */
  readonly label: string;
  /** From 1, for `aria-level` */
  readonly level: number;
  /** Its place among its siblings on view, from 1, for `aria-posinset` */
  readonly position: number;
  /** How many siblings are on view, for `aria-setsize` */
  readonly siblings: number;
  readonly parentId: SuTableRowId | null;
  /** Whether its children show; null for a row without children */
  readonly expanded: boolean | null;
  /** Its number, e.g. `2` or `1.3`, or null when it has none */
  readonly number: string | null;
  /** None for a group row */
  readonly cells: readonly SuTreeTableCell<TRow>[];
  /** Shown above the other rows, on every page, with its children */
  readonly pinned: boolean;
}

/** Everything needed to render the tree table */
export interface SuTreeTableState<TRow extends object> {
  readonly columns: readonly SuTreeTableColumnView<TRow>[];
  /** The rows of the current page, parents followed by their open children */
  readonly rows: readonly SuTreeTableRowView<TRow>[];
  /** The pinned rows and their open children, above the others on every page */
  readonly pinnedRows: readonly SuTreeTableRowView<TRow>[];
  /** Every column in the order they were set up, shown or not, e.g. for a column menu */
  readonly allColumns: readonly SuTableColumnState<TRow>[];
  /** The field that names each row (the first column), to render as the row's header cell */
  readonly rowHeaderKey: keyof TRow | null;
  readonly sort: SuTableSort<TRow> | null;
  /** Counts top-level rows: a parent and its children always share a page */
  readonly pagination: SuTablePagination;
  /** The latest change, for a live region */
  readonly announcement: string;
  readonly query: string;
  /** A search is narrowing the rows */
  readonly searching: boolean;
}

/** What a key press on a row did: the row to focus next, if any */
export type SuTreeTableKeyResult =
  | { readonly handled: false }
  | { readonly handled: true; readonly focusId: SuTableRowId };
