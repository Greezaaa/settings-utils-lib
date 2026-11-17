import { createSuStore, SuReadableStore } from '@su-labs/core';
import { suNormalizePageSize, suNormalizeText, suPageBounds, SuResolvedTableColumn, suResolveTableColumn, SuTableColumnLayout, SuTableLayoutChange, SuTablePageSize, SuTablePin, SuTableRowId, SuTableSort, suSearchTerms } from '@su-labs/core/table';
import { SU_TREE_TABLE_LABELS } from './tree-table.labels';
import { SuTreeTableCell, SuTreeTableColumn, SuTreeTableKeyResult, SuTreeTableLabels, SuTreeTableNumbering, SuTreeTableOptions, SuTreeTableRowKind, SuTreeTableRowView, SuTreeTableSpan, SuTreeTableState } from './tree-table.types';

/** A row in the tree, with its place in it */
interface TreeNode<TRow extends object> {
  readonly row: TRow;
  readonly id: SuTableRowId;
  readonly kind: SuTreeTableRowKind;
  readonly level: number;
  readonly parent: TreeNode<TRow> | null;
  children: readonly TreeNode<TRow>[];
}

/** The rows a search keeps: the matches, and the rows on the way to them */
interface SearchMarks<TRow extends object> {
  readonly matched: ReadonlySet<TreeNode<TRow>>;
  readonly leadsToMatch: ReadonlySet<TreeNode<TRow>>;
}

/** A row on screen, before its cells are laid out */
interface ShownRow<TRow extends object> {
  readonly node: TreeNode<TRow>;
  readonly position: number;
  readonly siblings: number;
  readonly expanded: boolean | null;
}

type SpanOf<TRow extends object> = (row: TRow) => SuTreeTableSpan | null;

function resolveSpan<TRow extends object, TKey extends keyof TRow>(
  column: SuTreeTableColumn<TRow, TKey>
): SpanOf<TRow> | null {
  return column.span
    ? row => column.span?.(row[column.key], row) ?? null
    : null;
}

const clamp = (value: number, max: number): number =>
  Math.max(1, Math.min(Math.floor(value), max));

/** The offsets a key moves the focus by, among the rows on screen */
const FOCUS_KEYS: Readonly<
  Record<string, (index: number, count: number) => number>
> = {
  ArrowUp: index => index - 1,
  ArrowDown: index => index + 1,
  Home: () => 0,
  End: (_index, count) => count - 1,
};

/**
 * Framework-agnostic tree table: rows with child rows, each a data row or a group row across the table, with
 * numbering, merged cells, and the table's sorting (siblings within each parent), search (a match keeps its parents
 * on view), paging (by top-level rows), pinned rows and columns in one reactive `state` store. Rendering is left to
 * the app, or to a framework package such as `@su-labs/tree-table` for Angular.
 * @typeParam TRow The row as the API sends it
 */
export class SuTreeTableController<TRow extends object> {
  private readonly layout = new SuTableColumnLayout<TRow>();
  private columnOptions: SuTreeTableOptions<TRow>['columns'] = [];
  private spans = new Map<keyof TRow, SpanOf<TRow>>();
  private labels: SuTreeTableLabels = SU_TREE_TABLE_LABELS;
  private rowIdOf: ((row: TRow) => SuTableRowId) | null = null;
  private readonly autoIds = new WeakMap<TRow, number>();
  private nextAutoId = 1;
  private childrenOf: SuTreeTableOptions<TRow>['children'] = undefined;
  private kindOf: SuTreeTableOptions<TRow>['rowKind'] = undefined;
  private groupLabelOf: SuTreeTableOptions<TRow>['groupLabel'] = undefined;
  private numbering: NonNullable<SuTreeTableOptions<TRow>['numbering']> =
    'nested';
  private unnumbered: SuTreeTableOptions<TRow>['unnumbered'] = undefined;
  private openByDefault = false;
  /** The rows opened or closed against `openByDefault` */
  private readonly toggled = new Set<SuTableRowId>();
  private roots: readonly TRow[] = [];
  private sort: SuTableSort<TRow> | null = null;
  private pinnedIds: readonly SuTableRowId[] = [];
  private query = '';
  private terms: readonly string[] = [];
  private pageSize: SuTablePageSize = 'all';
  private pageSizes: readonly SuTablePageSize[] = [];
  private page = 0;
  private announcement = '';
  private index = new Map<SuTableRowId, TreeNode<TRow>>();
  private readonly store = createSuStore<SuTreeTableState<TRow>>(this.build());

  /** Everything needed to render the tree table */
  readonly state: SuReadableStore<SuTreeTableState<TRow>> =
    this.store.asReadonly();

  constructor(
    options: SuTreeTableOptions<TRow> & { readonly rows?: readonly TRow[] } = {}
  ) {
    this.configure(options);
    if (options.rows) {
      this.setRows(options.rows);
    }
  }

  /** Changes the columns, the tree's shape, numbering, labels or paging */
  configure(options: SuTreeTableOptions<TRow>): void {
    this.labels = { ...this.labels, ...options.labels };
    this.columnOptions = options.columns ?? this.columnOptions;
    const columns = this.columnOptions ?? [];
    this.layout.configure(
      columns.map(column => suResolveTableColumn(column, this.labels)),
      this.labels
    );
    this.spans = new Map(
      columns.flatMap(column => {
        const span = resolveSpan(column);
        return span ? [[column.key, span] as const] : [];
      })
    );
    this.rowIdOf = options.rowId ?? this.rowIdOf;
    this.childrenOf = options.children ?? this.childrenOf;
    this.kindOf = options.rowKind ?? this.kindOf;
    this.groupLabelOf = options.groupLabel ?? this.groupLabelOf;
    this.numbering = options.numbering ?? this.numbering;
    this.unnumbered = options.unnumbered ?? this.unnumbered;
    this.pageSizes = options.pageSizes ?? this.pageSizes;
    this.pinnedIds = options.pinnedRows ?? this.pinnedIds;
    if (options.expanded !== undefined) {
      this.toggled.clear();
      this.openByDefault = options.expanded === true;
      if (Array.isArray(options.expanded)) {
        options.expanded.forEach(id => this.toggled.add(id));
      }
    }
    if (options.pageSize !== undefined) {
      this.pageSize = suNormalizePageSize(options.pageSize);
      this.page = 0;
    }
    this.publish();
  }

  /** Replaces the top-level rows (each with its children), e.g. with the API's response */
  setRows(rows: readonly TRow[]): void {
    this.roots = [...rows];
    const ids = new Set(rows.map(row => this.idOf(row)));
    this.pinnedIds = this.pinnedIds.filter(id => ids.has(id));
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

  /** The row with this id, at any level */
  rowOf(id: SuTableRowId): TRow | null {
    return this.index.get(id)?.row ?? null;
  }

  /** Whether a row's children show (when it has any) */
  isExpanded(id: SuTableRowId): boolean {
    return this.openByDefault !== this.toggled.has(id);
  }

  /** Shows a row's children, or hides them; without `expanded`, toggles it. Rows without children don't change */
  toggle(id: SuTableRowId, expanded = !this.isExpanded(id)): void {
    const node = this.index.get(id);
    if (
      !node ||
      node.children.length === 0 ||
      this.isExpanded(id) === expanded
    ) {
      return;
    }
    if (this.toggled.has(id)) {
      this.toggled.delete(id);
    } else {
      this.toggled.add(id);
    }
    this.publish();
  }

  /** Opens or closes every row */
  setAllExpanded(expanded: boolean): void {
    this.openByDefault = expanded;
    this.toggled.clear();
    this.publish();
  }

  /** The ids of the open rows that have children, at any level */
  expandedIds(): readonly SuTableRowId[] {
    return [...this.index.values()]
      .filter(node => node.children.length > 0 && this.isExpanded(node.id))
      .map(node => node.id);
  }

  /** Sorts each parent's children (and the top-level rows) by a column: ascending, descending, then as sent */
  sortBy(key: keyof TRow): void {
    const column = this.layout.find(key);
    if (!column?.compare) {
      return;
    }
    const direction = this.sort?.key === key ? this.sort.direction : null;
    this.page = 0;
    if (direction === 'descending') {
      this.sort = null;
      this.announcement = this.labels.sortCleared;
    } else {
      const next = direction === 'ascending' ? 'descending' : 'ascending';
      this.sort = { key, direction: next };
      const { header } = column.view;
      this.announcement =
        next === 'ascending'
          ? this.labels.sortedAscending(header)
          : this.labels.sortedDescending(header);
    }
    this.publish();
  }

  /**
   * Shows only the rows whose text holds every word of the query, ignoring case and accents, with their parents
   * (opened to show them) and their own children. Pinned rows stay.
   */
  search(query: string): void {
    if (query === this.query) {
      return;
    }
    this.query = query;
    this.terms = suSearchTerms(query);
    this.page = 0;
    const marks = this.searchMarks(this.unpinnedRoots(this.tree()));
    this.announcement = marks
      ? this.labels.matches(marks.matched.size)
      : this.labels.searchCleared;
    this.publish();
  }

  /** Shows a page, from 0; kept within the pages there are */
  setPage(page: number): void {
    const { pageCount } = this.store.get().pagination;
    const next = Math.max(0, Math.min(Math.floor(page), pageCount - 1));
    if (next === this.page) {
      return;
    }
    this.page = next;
    this.announcement = this.labels.page(next + 1, pageCount);
    this.publish();
  }

  /** Changes how many top-level rows a page shows, keeping the first one on screen in view */
  setPageSize(pageSize: SuTablePageSize): void {
    const { rangeStart, totalRows } = this.store.get().pagination;
    this.pageSize = suNormalizePageSize(pageSize);
    this.page =
      this.pageSize === 'all'
        ? 0
        : Math.floor(Math.max(0, rangeStart - 1) / this.pageSize);
    const { page, count } = suPageBounds(totalRows, this.pageSize, this.page);
    this.announcement = this.labels.page(page + 1, count);
    this.publish();
  }

  /** Pins a top-level row (with its children) above the others, on every page, or unpins it; without `pinned`, toggles it */
  pinRow(id: SuTableRowId, pinned = !this.pinnedIds.includes(id)): void {
    const node = this.index.get(id);
    if (!node || node.parent || this.pinnedIds.includes(id) === pinned) {
      return;
    }
    this.pinnedIds = pinned
      ? [...this.pinnedIds, id]
      : this.pinnedIds.filter(item => item !== id);
    const label = this.labelOf(node);
    this.announcement = pinned
      ? this.labels.rowPinned(label)
      : this.labels.rowUnpinned(label);
    this.publish();
  }

  /** Shows or hides a column; the last column on view stays shown, and hidden columns are left out of the search */
  setColumnVisible(key: keyof TRow, visible: boolean): void {
    this.applyLayout(this.layout.setVisible(key, visible));
  }

  /** Shows or hides the pin in a column's heading; taking it away also unpins the column */
  setColumnPinnable(key: keyof TRow, pinnable: boolean): void {
    this.applyLayout(this.layout.setPinnable(key, pinnable));
  }

  /** Shows every column, or hides all but the first one on view */
  setColumnsVisible(visible: boolean): void {
    this.applyLayout(this.layout.setAllVisible(visible));
  }

  /** Pins a column to an edge, keeping it in view while the others scroll, or unpins it with null */
  pinColumn(key: keyof TRow, pin: SuTablePin | null): void {
    this.applyLayout(this.layout.pin(key, pin));
  }

  /**
   * Handles a key on a row: the up and down arrows, Home and End move between the rows on screen; the right arrow
   * opens a row, or moves to its first child; the left arrow closes it, or moves to its parent; Enter and Space open
   * or close it.
   * @returns Whether the key was handled (to prevent its default), and the row to focus
   */
  rowKey(id: SuTableRowId, key: string): SuTreeTableKeyResult {
    const { pinnedRows, rows } = this.store.get();
    const onScreen = [...pinnedRows, ...rows];
    const index = onScreen.findIndex(row => row.id === id);
    const row = onScreen[index];
    if (!row) {
      return { handled: false };
    }
    const move = FOCUS_KEYS[key];
    if (move) {
      const target = onScreen[move(index, onScreen.length)];
      return { handled: true, focusId: target?.id ?? id };
    }
    if (key === 'ArrowRight') {
      const child = onScreen[index + 1];
      if (row.expanded === false) {
        this.toggle(id, true);
      }
      const focusId =
        row.expanded === true && child?.parentId === id ? child.id : id;
      return { handled: true, focusId };
    }
    if (key === 'ArrowLeft') {
      if (row.expanded === true) {
        this.toggle(id, false);
      }
      const focusId =
        row.expanded !== true && row.parentId !== null ? row.parentId : id;
      return { handled: true, focusId };
    }
    if ((key === 'Enter' || key === ' ') && row.expanded !== null) {
      this.toggle(id);
      return { handled: true, focusId: id };
    }
    return { handled: false };
  }

  private applyLayout(change: SuTableLayoutChange): void {
    if (!change) {
      return;
    }
    if (change.announcement !== null) {
      this.announcement = change.announcement;
    }
    this.publish();
  }

  /** The tree, each parent's children sorted when a column sorts */
  private tree(): readonly TreeNode<TRow>[] {
    const sort = this.sort;
    const compare = sort ? this.layout.find(sort.key)?.compare : undefined;
    const factor = sort?.direction === 'descending' ? -1 : 1;
    const index = new Map<SuTableRowId, TreeNode<TRow>>();
    const grow = (
      rows: readonly TRow[],
      parent: TreeNode<TRow> | null
    ): readonly TreeNode<TRow>[] => {
      const nodes = rows.map(row => {
        const node: TreeNode<TRow> = {
          row,
          id: this.idOf(row),
          kind: this.kindOf?.(row) ?? 'data',
          level: (parent?.level ?? 0) + 1,
          parent,
          children: [],
        };
        index.set(node.id, node);
        node.children = grow(this.childrenOf?.(row) ?? [], node);
        return node;
      });
      return compare
        ? [...nodes].sort((a, b) => factor * compare(a.row, b.row))
        : nodes;
    };
    const roots = grow(this.roots, null);
    this.index = index;
    return roots;
  }

  private pinnedRoots(): readonly TreeNode<TRow>[] {
    return this.pinnedIds.flatMap(id => {
      const node = this.index.get(id);
      return node && !node.parent ? [node] : [];
    });
  }

  private unpinnedRoots(
    roots: readonly TreeNode<TRow>[]
  ): readonly TreeNode<TRow>[] {
    return roots.filter(node => !this.pinnedIds.includes(node.id));
  }

  private labelOf(node: TreeNode<TRow>): string {
    const text = this.layout.all[0]?.text(node.row) ?? '';
    const label =
      node.kind === 'group' ? (this.groupLabelOf?.(node.row) ?? text) : text;
    return label || String(node.id);
  }

  private matches(node: TreeNode<TRow>): boolean {
    if (node.kind === 'data') {
      return this.layout.matches(node.row, this.terms);
    }
    const label = suNormalizeText(this.labelOf(node));
    return this.terms.every(term => label.includes(term));
  }

  private searchMarks(
    roots: readonly TreeNode<TRow>[]
  ): SearchMarks<TRow> | null {
    if (this.terms.length === 0) {
      return null;
    }
    const matched = new Set<TreeNode<TRow>>();
    const leadsToMatch = new Set<TreeNode<TRow>>();
    const visit = (node: TreeNode<TRow>): boolean => {
      const below = node.children.map(visit).some(Boolean);
      if (below) {
        leadsToMatch.add(node);
      }
      const own = this.matches(node);
      if (own) {
        matched.add(node);
      }
      return own || below;
    };
    roots.forEach(visit);
    return { matched, leadsToMatch };
  }

  /** Whether a search keeps the row: a match, a row on the way to one, or a row under a match */
  private isListed(
    node: TreeNode<TRow>,
    marks: SearchMarks<TRow> | null,
    underMatch: boolean
  ): boolean {
    return (
      !marks ||
      underMatch ||
      marks.matched.has(node) ||
      marks.leadsToMatch.has(node)
    );
  }

  /** Each row followed by its open children, in order */
  private flatten(
    nodes: readonly TreeNode<TRow>[],
    marks: SearchMarks<TRow> | null,
    underMatch: boolean,
    offset: number,
    siblings: number
  ): ShownRow<TRow>[] {
    return nodes.flatMap((node, index) => {
      const childrenUnderMatch = underMatch || !!marks?.matched.has(node);
      const children = node.children.filter(child =>
        this.isListed(child, marks, childrenUnderMatch)
      );
      const hasChildren = node.children.length > 0;
      const open =
        hasChildren &&
        (!!marks?.leadsToMatch.has(node) || this.isExpanded(node.id));
      const shown: ShownRow<TRow> = {
        node,
        position: offset + index + 1,
        siblings,
        expanded: hasChildren ? open : null,
      };
      return open
        ? [
            shown,
            ...this.flatten(
              children,
              marks,
              childrenUnderMatch,
              0,
              children.length
            ),
          ]
        : [shown];
    });
  }

  private numberingOf(row: TRow): SuTreeTableNumbering {
    return typeof this.numbering === 'function'
      ? this.numbering(row)
      : this.numbering;
  }

  /** Every row's number, counted through the whole tree in display order, open or not */
  private numbers(
    roots: readonly TreeNode<TRow>[]
  ): Map<TreeNode<TRow>, string | null> {
    const numbers = new Map<TreeNode<TRow>, string | null>();
    const count = (
      nodes: readonly TreeNode<TRow>[],
      counter: { next: number },
      prefix: string
    ): void => {
      nodes.forEach(node => {
        const own = this.unnumbered?.(node.row)
          ? null
          : `${prefix}${counter.next++}`;
        numbers.set(node, own);
        if (node.children.length === 0) {
          return;
        }
        const numbering = this.numberingOf(node.row);
        if (numbering === 'continue') {
          count(node.children, counter, prefix);
        } else if (numbering === 'nested') {
          count(node.children, { next: 1 }, own === null ? prefix : `${own}.`);
        } else {
          count(node.children, { next: 1 }, '');
        }
      });
    };
    count(roots, { next: 1 }, '');
    return numbers;
  }

  /** The rows with their cells, the cells under a span left out */
  private rowViews(
    shown: readonly ShownRow<TRow>[],
    columns: readonly SuResolvedTableColumn<TRow>[],
    numbers: Map<TreeNode<TRow>, string | null>
  ): SuTreeTableRowView<TRow>[] {
    const covered = shown.map(() => new Set<number>());
    const isFree = (rowIndex: number, from: number, to: number): boolean => {
      for (let column = from; column < to; column++) {
        if (covered[rowIndex]?.has(column)) {
          return false;
        }
      }
      return true;
    };
    return shown.map(({ node, position, siblings, expanded }, rowIndex) => {
      const cells: SuTreeTableCell<TRow>[] = [];
      if (node.kind === 'data') {
        columns.forEach((column, columnIndex) => {
          if (covered[rowIndex]?.has(columnIndex)) {
            return;
          }
          const span = this.spans.get(column.key)?.(node.row) ?? null;
          const pin = this.layout.pinOf(column);
          let maxColumns = 1;
          while (
            columnIndex + maxColumns < columns.length &&
            this.layout.pinOf(columns[columnIndex + maxColumns]) === pin &&
            isFree(
              rowIndex,
              columnIndex + maxColumns,
              columnIndex + maxColumns + 1
            )
          ) {
            maxColumns++;
          }
          const colSpan = clamp(span?.columns ?? 1, maxColumns);
          let maxRows = 1;
          while (
            rowIndex + maxRows < shown.length &&
            this.continuesSpan(node, shown[rowIndex + maxRows]?.node) &&
            isFree(rowIndex + maxRows, columnIndex, columnIndex + colSpan)
          ) {
            maxRows++;
          }
          const rowSpan =
            columnIndex === 0 ? 1 : clamp(span?.rows ?? 1, maxRows);
          for (let row = rowIndex; row < rowIndex + rowSpan; row++) {
            for (
              let spanned = columnIndex;
              spanned < columnIndex + colSpan;
              spanned++
            ) {
              covered[row]?.add(spanned);
            }
          }
          cells.push({
            key: column.key,
            columnIndex,
            text: column.text(node.row),
            rowSpan,
            colSpan,
          });
        });
      }
      return {
        id: node.id,
        data: node.row,
        kind: node.kind,
        label: this.labelOf(node),
        level: node.level,
        position,
        siblings,
        parentId: node.parent?.id ?? null,
        expanded,
        number: numbers.get(node) ?? null,
        cells,
        pinned: !node.parent && this.pinnedIds.includes(node.id),
      };
    });
  }

  /** A row a span can reach down to: a data row still among the spanning row's parent's rows */
  private continuesSpan(
    from: TreeNode<TRow>,
    next: TreeNode<TRow> | undefined
  ): boolean {
    return next?.kind === 'data' && next.level >= from.level;
  }

  private publish(): void {
    const state = this.build();
    this.page = state.pagination.page;
    this.store.set(state);
  }

  private build(): SuTreeTableState<TRow> {
    const roots = this.tree();
    const columns = this.layout.displayed();
    const pinned = this.pinnedRoots();
    const unpinned = this.unpinnedRoots(roots);
    const numbers = this.numbers([...pinned, ...unpinned]);
    const marks = this.searchMarks(unpinned);
    const listed = unpinned.filter(node => this.isListed(node, marks, false));
    const { page, count, start, end } = suPageBounds(
      listed.length,
      this.pageSize,
      this.page
    );
    const rows = this.flatten(
      listed.slice(start, end),
      marks,
      false,
      start,
      listed.length
    );
    const pinnedRows = this.flatten(pinned, null, false, 0, pinned.length);
    return {
      columns: this.layout
        .views(this.sort)
        .map(({ editor: _editor, ...column }) => column),
      rows: this.rowViews(rows, columns, numbers),
      pinnedRows: this.rowViews(pinnedRows, columns, numbers),
      allColumns: this.layout.states(),
      rowHeaderKey: this.layout.rowHeaderKey(),
      sort: this.sort,
      pagination: {
        page,
        pageCount: count,
        pageSize: this.pageSize,
        pageSizes: this.pageSizes,
        totalRows: listed.length,
        rangeStart: listed.length > 0 ? start + 1 : 0,
        rangeEnd: end,
      },
      announcement: this.announcement,
      query: this.query,
      searching: marks !== null,
    };
  }
}
