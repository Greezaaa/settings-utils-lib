/** A row's identity, usually the API's own id */
export type SuTableRowId = string | number;

/** The kind of form control a column is edited with */
export type SuTableInput =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'textarea';

/** A form control's value: a boolean for `checkbox`, text for every other input */
export type SuTableInputValue = string | boolean;

/** Which way a column is sorted */
export type SuTableSortDirection = 'ascending' | 'descending';

/** How many rows are selected: none, some or all of them */
export type SuTableSelection = 'none' | 'some' | 'all';

/** Text alignment of a column's cells */
export type SuTableAlign = 'start' | 'center' | 'end';

/** Which edge a column is pinned to, staying in view while the others scroll */
export type SuTablePin = 'start' | 'end';

/** One choice of a `select` editor */
export interface SuTableOption {
  /** The control's value, turned back into the API value by the editor's `parse` */
  readonly value: string;
  readonly label: string;
}

/** Extra attributes for the form control */
export interface SuTableInputAttributes {
  readonly min?: number | string;
  readonly max?: number | string;
  readonly step?: number;
  readonly maxLength?: number;
  readonly placeholder?: string;
}

/**
 * How a field is edited: which control, and how its value maps to the API value and back. The ready-made editors
 * (`suTextEditor`, `suNumberEditor`, `suCheckboxEditor`, `suSelectEditor`, `suDateEditor`) cover the usual fields.
 */
export interface SuTableEditor<TValue> {
  readonly input: SuTableInput;
  /** The choices of a `select` */
  readonly options?: readonly SuTableOption[];
  readonly attributes?: SuTableInputAttributes;
  /** The API value as the control's value */
  toInput(value: TValue): SuTableInputValue;
  /** The control's value back as the API value */
  parse(input: SuTableInputValue): TValue;
  /** A message when the parsed value isn't valid, or null */
  validate?(value: TValue): string | null;
}

/**
 * Maps one field of the API row to a column.
 * @typeParam TRow The row as the API sends it
 * @typeParam TKey The field this column shows
 */
export interface SuTableColumn<TRow extends object, TKey extends keyof TRow> {
  /** The field in the row */
  readonly key: TKey;
  /** The column's heading */
  readonly header: string;
  /** The cell's text; by default the value as text (booleans as the `yes` and `no` labels, nothing for null) */
  format?(value: TRow[TKey], row: TRow): string;
  /** Whether the column can be sorted, or how two values compare (negative when `a` comes first) @default false */
  readonly sortable?: boolean | ((a: TRow[TKey], b: TRow[TKey]) => number);
  /** How the field is edited; without it, the column is read-only */
  readonly edit?: SuTableEditor<TRow[TKey]>;
  /** A message when an edited value isn't valid for this row, or null */
  validate?(value: TRow[TKey], row: TRow): string | null;
  /** @default 'start' */
  readonly align?: SuTableAlign;
  /** Keeps the column in view at one edge while the others scroll; `pinColumn` changes it later */
  readonly pinned?: SuTablePin;
}

/** Every column of a table, each typed by its own field */
export type SuTableColumns<TRow extends object> = readonly {
  [TKey in keyof TRow]-?: SuTableColumn<TRow, TKey>;
}[keyof TRow][];

/** A button on each row (edit, delete, duplicate…), handled by the app */
export interface SuTableAction<TRow extends object> {
  readonly id: string;
  readonly label: string;
  /** It does something that can't be undone, e.g. delete @default false */
  readonly danger?: boolean;
  /** Also offered for the selected rows @default false */
  readonly bulk?: boolean;
  /** Leaves the button out for this row */
  hidden?(row: TRow): boolean;
  /** Shows the button disabled for this row */
  disabled?(row: TRow): boolean;
}

/** Texts the table announces to screen readers and shows on its controls, e.g. in the page's language */
export interface SuTableLabels {
  readonly sortedAscending: (header: string) => string;
  readonly sortedDescending: (header: string) => string;
  readonly sortCleared: string;
  readonly selected: (count: number) => string;
  readonly grabbed: (position: number, total: number) => string;
  readonly moved: (position: number, total: number) => string;
  readonly dropped: (position: number, total: number) => string;
  readonly moveCancelled: string;
  readonly editing: (count: number) => string;
  readonly saved: (count: number) => string;
  readonly editCancelled: string;
  readonly invalid: (count: number) => string;
  readonly yes: string;
  readonly no: string;
  readonly empty: string;
  readonly selectAll: string;
  readonly selectRow: (rowLabel: string) => string;
  readonly moveRow: (rowLabel: string) => string;
  /** Heading of the move handles' column */
  readonly order: string;
  readonly actions: string;
  readonly save: string;
  readonly cancel: string;
  readonly editSelected: (count: number) => string;
  readonly clearSelection: string;
  readonly mixed: string;
  readonly columns: string;
  readonly pinNone: string;
  readonly pinStart: string;
  readonly pinEnd: string;
  readonly columnPinned: (header: string, pin: SuTablePin) => string;
  readonly columnUnpinned: (header: string) => string;
}

/** What the table is set up with; `configure` changes any of it later */
export interface SuTableOptions<TRow extends object> {
  readonly columns?: SuTableColumns<TRow>;
  /**
   * The row's identity; by default each row object gets its own, so pass the API's id to keep the selection across
   * `setRows`
   */
  readonly rowId?: (row: TRow) => SuTableRowId;
  readonly actions?: readonly SuTableAction<TRow>[];
  /** Any texts to replace, see `SU_TABLE_LABELS` */
  readonly labels?: Partial<SuTableLabels>;
}

/** The current sort */
export interface SuTableSort<TRow extends object> {
  readonly key: keyof TRow;
  readonly direction: SuTableSortDirection;
}

/** How a column's field is edited, ready to render */
export interface SuTableEditorView {
  readonly input: SuTableInput;
  readonly options: readonly SuTableOption[];
  readonly attributes: SuTableInputAttributes;
}

/** A column, ready to render */
export interface SuTableColumnView<TRow extends object> {
  readonly key: keyof TRow;
  readonly header: string;
  readonly align: SuTableAlign;
  /** Pinned columns come first (`start`) or last (`end`), in their own order */
  readonly pinned: SuTablePin | null;
  readonly sortable: boolean;
  /** For `aria-sort` */
  readonly sort: SuTableSortDirection | 'none';
  readonly editor: SuTableEditorView | null;
}

/** One cell's text */
export interface SuTableCell<TRow extends object> {
  readonly key: keyof TRow;
  readonly text: string;
}

/** A row action, resolved for one row */
export interface SuTableActionView {
  readonly id: string;
  readonly label: string;
  readonly danger: boolean;
  readonly disabled: boolean;
}

/** A row, ready to render */
export interface SuTableRowView<TRow extends object> {
  readonly id: SuTableRowId;
  /** The row as the API sent it (or as edited) */
  readonly data: TRow;
  /** The first column's text (as configured, wherever it's pinned), to name the row in labels */
  readonly label: string;
  readonly cells: readonly SuTableCell<TRow>[];
  readonly selected: boolean;
  readonly actions: readonly SuTableActionView[];
}

/** One field being edited */
export interface SuTableDraftField<TRow extends object> {
  readonly key: keyof TRow;
  readonly header: string;
  readonly editor: SuTableEditorView;
  readonly value: SuTableInputValue;
  /** The rows being edited have different values, and the field hasn't been changed */
  readonly mixed: boolean;
  /** Changed since editing began; only changed fields are saved */
  readonly changed: boolean;
  readonly error: string | null;
}

/** The rows being edited: one row inline, or many at once */
export interface SuTableDraft<TRow extends object> {
  readonly ids: readonly SuTableRowId[];
  readonly bulk: boolean;
  readonly fields: readonly SuTableDraftField<TRow>[];
}

/** Everything needed to render the table */
export interface SuTableState<TRow extends object> {
  readonly columns: readonly SuTableColumnView<TRow>[];
  /** In display order: sorted, or as reordered */
  readonly rows: readonly SuTableRowView<TRow>[];
  /** The field that names each row (the first column), to render as the row's header cell */
  readonly rowHeaderKey: keyof TRow | null;
  readonly sort: SuTableSort<TRow> | null;
  readonly selectedIds: readonly SuTableRowId[];
  readonly selection: SuTableSelection;
  /** The actions offered for the selected rows */
  readonly bulkActions: readonly SuTableActionView[];
  readonly editable: boolean;
  readonly draft: SuTableDraft<TRow> | null;
  /** The row picked up with the keyboard, or null */
  readonly grabbedId: SuTableRowId | null;
  /** The latest change, for a live region */
  readonly announcement: string;
}

/** The outcome of `save` */
export type SuTableSaveResult<TRow extends object> =
  | { readonly ok: true; readonly rows: readonly TRow[] }
  | { readonly ok: false; readonly errors: number };

/** What a key press on a row's move handle did */
export type SuTableMoveKeyResult =
  | { readonly handled: false }
  | { readonly handled: true; readonly order: readonly SuTableRowId[] | null };
