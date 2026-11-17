import { SuTableColumn, SuTableColumnView, SuTableEditorView, SuTableInputValue, SuTableLabels } from './table.types';

/** A column with its field mapping turned into functions of the whole row, shared by the table controllers */
export interface SuResolvedTableColumn<TRow extends object> {
  readonly key: keyof TRow;
  readonly view: Omit<SuTableColumnView<TRow>, 'sort'>;
  readonly compare: ((a: TRow, b: TRow) => number) | null;
  readonly searchable: boolean;
  readonly hidden: boolean;
  readonly pinnable: boolean;
  text(row: TRow): string;
  toInput(row: TRow): SuTableInputValue;
  apply(
    row: TRow,
    input: SuTableInputValue
  ): { readonly row: TRow; readonly error: string | null };
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

/** Turns a column's field mapping into functions of the whole row */
export function suResolveTableColumn<
  TRow extends object,
  TKey extends keyof TRow,
>(
  column: SuTableColumn<TRow, TKey>,
  labels: SuTableLabels
): SuResolvedTableColumn<TRow> {
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
      pinnable: column.pinnable ?? column.pinned !== undefined,
      sortable: sortable !== false,
      editor,
    },
    searchable: column.searchable ?? true,
    hidden: column.hidden ?? false,
    pinnable: column.pinnable ?? column.pinned !== undefined,
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
