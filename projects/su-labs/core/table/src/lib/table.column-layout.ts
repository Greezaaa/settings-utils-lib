import { SuResolvedTableColumn } from './table.columns';
import { SU_TABLE_LABELS } from './table.labels';
import { SuTableColumnState, SuTableColumnView, SuTableLabels, SuTablePin, SuTableSort } from './table.types';

/** What a layout change did: null when nothing changed, else the text to announce (if any) */
export type SuTableLayoutChange = {
  readonly announcement: string | null;
} | null;

/** Lowercase text without accents, for searching */
export function suNormalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

/** The words of a search query, normalized for `suNormalizeText` */
export function suSearchTerms(query: string): readonly string[] {
  return suNormalizeText(query).split(/\s+/).filter(Boolean);
}

/**
 * Which columns show, in what order, where they're pinned and whether their headings show a pin; shared by the
 * table controllers
 */
export class SuTableColumnLayout<TRow extends object> {
  private columns: readonly SuResolvedTableColumn<TRow>[] = [];
  private labels: SuTableLabels = SU_TABLE_LABELS;
  private readonly pins = new Map<keyof TRow, SuTablePin | null>();
  private readonly visibility = new Map<keyof TRow, boolean>();
  private readonly pinnability = new Map<keyof TRow, boolean>();

  /** Every column, in the order they were set up */
  get all(): readonly SuResolvedTableColumn<TRow>[] {
    return this.columns;
  }

  configure(
    columns: readonly SuResolvedTableColumn<TRow>[],
    labels: SuTableLabels
  ): void {
    this.columns = columns;
    this.labels = labels;
  }

  find(key: keyof TRow): SuResolvedTableColumn<TRow> | undefined {
    return this.columns.find(column => column.key === key);
  }

  /** The last column on view stays shown */
  setVisible(key: keyof TRow, visible: boolean): SuTableLayoutChange {
    const column = this.find(key);
    if (!column || this.isVisible(column) === visible) {
      return null;
    }
    if (
      !visible &&
      this.columns.filter(item => this.isVisible(item)).length === 1
    ) {
      return null;
    }
    this.visibility.set(key, visible);
    const { header } = column.view;
    return {
      announcement: visible
        ? this.labels.columnShown(header)
        : this.labels.columnHidden(header),
    };
  }

  /** Taking the pin away also unpins the column, so nothing stays pinned without a way back */
  setPinnable(key: keyof TRow, pinnable: boolean): SuTableLayoutChange {
    const column = this.find(key);
    if (!column || this.isPinnable(column) === pinnable) {
      return null;
    }
    this.pinnability.set(key, pinnable);
    if (!pinnable && this.pinOf(column)) {
      this.pins.set(key, null);
      return { announcement: this.labels.columnUnpinned(column.view.header) };
    }
    return { announcement: null };
  }

  /** Shows every column, or hides all but the first one on view */
  setAllVisible(visible: boolean): SuTableLayoutChange {
    const shown = this.columns.filter(column => this.isVisible(column));
    const keep = this.displayed()[0];
    this.columns.forEach(column =>
      this.visibility.set(column.key, visible || column === keep)
    );
    const changed = visible
      ? shown.length < this.columns.length
      : shown.length > 1;
    if (!changed) {
      return null;
    }
    return {
      announcement: visible
        ? this.labels.allColumnsShown
        : this.labels.columnsHidden,
    };
  }

  pin(key: keyof TRow, pin: SuTablePin | null): SuTableLayoutChange {
    const column = this.find(key);
    if (!column || this.pinOf(column) === pin) {
      return null;
    }
    this.pins.set(key, pin);
    const { header } = column.view;
    return {
      announcement: pin
        ? this.labels.columnPinned(header, pin)
        : this.labels.columnUnpinned(header),
    };
  }

  pinOf(column: SuResolvedTableColumn<TRow>): SuTablePin | null {
    return this.pins.has(column.key)
      ? (this.pins.get(column.key) ?? null)
      : column.view.pinned;
  }

  isPinnable(column: SuResolvedTableColumn<TRow>): boolean {
    return this.pinnability.get(column.key) ?? column.pinnable;
  }

  isVisible(column: SuResolvedTableColumn<TRow>): boolean {
    return this.visibility.get(column.key) ?? !column.hidden;
  }

  /** The columns in display order: pinned to the start, the rest, then pinned to the end */
  displayed(): readonly SuResolvedTableColumn<TRow>[] {
    const rank = (column: SuResolvedTableColumn<TRow>): number => {
      const pin = this.pinOf(column);
      return pin === 'start' ? 0 : pin === 'end' ? 2 : 1;
    };
    return this.columns
      .filter(column => this.isVisible(column))
      .sort((a, b) => rank(a) - rank(b));
  }

  /** The displayed columns, ready to render */
  views(sort: SuTableSort<TRow> | null): SuTableColumnView<TRow>[] {
    return this.displayed().map(column => ({
      ...column.view,
      pinned: this.pinOf(column),
      pinnable: this.isPinnable(column),
      sort: sort?.key === column.key ? sort.direction : 'none',
    }));
  }

  /** Every column, shown or not, e.g. for a column menu */
  states(): SuTableColumnState<TRow>[] {
    return this.columns.map(column => ({
      key: column.key,
      header: column.view.header,
      visible: this.isVisible(column),
      pinned: this.pinOf(column),
      pinnable: this.isPinnable(column),
    }));
  }

  /** The field that names each row: the first column on view */
  rowHeaderKey(): keyof TRow | null {
    return this.columns.find(column => this.isVisible(column))?.key ?? null;
  }

  /** Whether the row's text, in the searchable columns on view, holds every term */
  matches(row: TRow, terms: readonly string[]): boolean {
    const text = suNormalizeText(
      this.columns
        .filter(column => column.searchable && this.isVisible(column))
        .map(column => column.text(row))
        .join(' ')
    );
    return terms.every(term => text.includes(term));
  }
}
