# Tree Table

`@su-labs/tree-table`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/tree-table?style=for-the-badge)

Accessible tree tables for Angular: rows with child rows that open and close, with the look and features of
[`@su-labs/table`](https://www.npmjs.com/package/@su-labs/table).

> **Not using Angular?** The same logic is in [`@su-labs/core/tree-table`](https://www.npmjs.com/package/@su-labs/core).

## Features

- **Nested rows**: any depth; a parent is a **data row** with its own cells, or a **group row**, a heading across the
  table over its children
- **Numbering**: a numbers column that **nests** (1, 1.1, 1.2), **restarts** or **continues** through the children,
  chosen per parent, with group rows (or any rows) left unnumbered
- **Merged cells**: a column merges a cell with the cells below or after it, as real `rowspan` and `colspan` cells
- **From the table**: sorting, search, paging, pinned rows and columns, the Columns menu, a sticky header, custom
  cells and the `--su-table-*` theming
- **Accessible**: `role="treegrid"` with `aria-level`, `aria-expanded`, `aria-setsize` and `aria-posinset`, and the
  arrow keys to move, open and close rows

## Installation

```bash
npm install @su-labs/tree-table
```

On Angular 19, 20 or 21, install the matching version: `npm install @su-labs/tree-table@ng19`, `@ng20` or `@ng21`.

Peer dependencies: `@angular/core` and `@angular/common` 22.

## Quick Start

```ts
import { SuTreeTableColumns, SuTreeTableComponent } from '@su-labs/tree-table';

interface Item {
  readonly id: string;
  readonly name: string;
  readonly unit?: string;
  readonly price?: number;
  readonly isGroup?: boolean;
  readonly children?: readonly Item[];
}

@Component({
  selector: 'app-price-list',
  imports: [SuTreeTableComponent],
  template: `
    <su-lib-tree-table
      caption="Price list"
      numbered
      searchable
      [columns]="columns"
      [rows]="items()"
      [rowId]="itemId"
      [children]="childrenOf"
      [rowKind]="kindOf"
      [unnumbered]="isGroup"
      [expanded]="['fruit']" />
  `,
})
export class PriceListPage {
  protected readonly items = signal<readonly Item[]>([]);
  protected readonly itemId = (item: Item) => item.id;
  protected readonly childrenOf = (item: Item) => item.children;
  protected readonly kindOf = (item: Item) => (item.isGroup ? 'group' : 'data');
  protected readonly isGroup = (item: Item) => item.isGroup === true;

  protected readonly columns: SuTreeTableColumns<Item> = [
    { key: 'name', header: 'Item', sortable: true },
    { key: 'unit', header: 'Unit' },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      align: 'end',
      format: price => (price === undefined ? '' : `€${price}`),
    },
  ];
}
```

## Data parents and group rows

Every row with `children` opens and closes. By default it's a **data row**: it has its own cells, like any other row.
Mark a row as a **group** with `rowKind` and it becomes a heading across the table, over its children, with no cells of
its own; its text is the first column's, or `groupLabel(row)`.

## Numbering

`numbered` adds a first column with each row's number. `numbering` says how a parent's children are counted, for every
parent or per parent with a function:

| `numbering`          | A parent numbered 2 | Then |
| -------------------- | ------------------- | ---- |
| `'nested'` (default) | children 2.1, 2.2   | 3    |
| `'restart'`          | children 1, 2       | 3    |
| `'continue'`         | children 3, 4       | 5    |

`unnumbered(row)` leaves rows without a number, and they don't count: e.g. `(row) => row.isGroup` numbers only the data
rows. Under an unnumbered group, `nested` children start again from 1 in each group, while `continue` keeps one count
across the groups. Numbers count the whole tree in the order on screen, open or not, so closing, opening or searching
doesn't change them; sorting does.

## Merged cells

A column's `span(value, row)` returns how many cells this one takes: `rows` below it and `columns` after it, itself
included.

```ts
{ key: 'unit', header: 'Unit', span: (unit, item) => (item.id === 'apples' ? { rows: 2 } : null) },
{ key: 'note', header: 'Note', span: (note, item) => (item.isTotal ? { columns: 2 } : null) },
```

They render as real `rowspan` and `colspan` cells, so screen readers read each merged cell with every row and column it
covers. A row span stops at a group row, at the end of its parent's rows and at the end of the page, and a column span
stays within its column's pinned side. The first column holds the open and close buttons, so it's never merged down.

## Search, sorting, paging and pinned rows

- **Search** (`searchable`) keeps the rows that match, the parents on the way to them (opened to show them) and the
  matches' own children; a group row matches on its text
- **Sorting** sorts each parent's children by the column, and the top-level rows, never mixing levels
- **Paging** (`pageSize`, `pageSizes`) counts top-level rows, so a parent and its children always share a page
- **Pinned rows** (`rowPinning`, `pinnedRows`) are top-level rows, kept above the others with their children

Pinned columns, the Columns menu, `maxHeight` and custom cells work as in
[`@su-labs/table`](https://www.npmjs.com/package/@su-labs/table#pinned-columns).

## Custom cells

```html
<su-lib-tree-table
  caption="Price list"
  [columns]="columns"
  [rows]="items()"
  [children]="childrenOf">
  <ng-template
    suTableCell="price"
    [suTableCellOf]="items()"
    let-item
    let-text="text">
    <strong>{{ text }}</strong>
  </ng-template>
</su-lib-tree-table>
```

Import `SuTableCellDirective` from `@su-labs/tree-table` too.

## API

### Inputs

| Input                       | Default                 | Description                                                                                  |
| --------------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| `columns`                   | —                       | `SuTreeTableColumns<TRow>`: like table columns without `edit`, plus `span`                   |
| `rows`                      | —                       | The top-level rows, each with its children                                                   |
| `caption`                   | —                       | The table's name for screen readers                                                          |
| `showCaption`               | `false`                 | Shows the caption on screen too                                                              |
| `rowId`                     | each row object         | The row's identity; keeps open and pinned rows when new rows arrive                          |
| `children`                  | —                       | A row's child rows, e.g. `(item) => item.children`                                           |
| `rowKind`                   | every row `'data'`      | `'group'` for heading rows across the table                                                  |
| `groupLabel`                | the first column's text | A group row's text                                                                           |
| `expanded`                  | `false`                 | The ids of the rows open to start with, or `true` for every one                              |
| `numbered`                  | `false`                 | A first column with each row's number                                                        |
| `numbering`                 | `'nested'`              | `'nested'`, `'restart'` or `'continue'`, or a function of the parent row                     |
| `unnumbered`                | —                       | Rows without a number                                                                        |
| `columnControls`            | `false`                 | The Columns menu                                                                             |
| `searchable`                | `false`                 | A search box above the table                                                                 |
| `pageSize` / `pageSizes`    | `'all'` / `[]`          | Top-level rows per page, and the sizes to choose from                                        |
| `rowPinning` / `pinnedRows` | `false` / —             | A Pin button on each top-level row, and the ids pinned to start with                         |
| `maxHeight`                 | —                       | Any CSS length: the table scrolls inside, keeping the header and pinned rows in view         |
| `rowClass`                  | —                       | Extra classes for a row, e.g. `is-muted` or `is-highlighted`                                 |
| `labels`                    | English                 | `Partial<SuTreeTableLabels>`: the table's texts plus `expandRow`, `collapseRow` and `number` |

### Outputs

| Output             | Payload                                                      |
| ------------------ | ------------------------------------------------------------ |
| `toggled`          | `{ row, expanded, expandedIds }` after a row opens or closes |
| `sortChange`       | `{ key, direction } \| null`                                 |
| `searchChange`     | The query, once typing pauses                                |
| `pageChange`       | `{ page, pageSize }`, the page from 0                        |
| `pinnedRowsChange` | The ids of the pinned rows, in pin order                     |
| `columnsChange`    | Every column's state after a change in the Columns menu      |

## Keyboard

One row is in the tab order; the arrow keys move between rows.

| Key                            | Does                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| ↓ / ↑                          | Next or previous row                                           |
| Home / End                     | First or last row on screen                                    |
| →                              | Opens a closed row, or moves to the first child of an open one |
| ←                              | Closes an open row, or moves to the parent                     |
| Enter or Space                 | Opens or closes the row                                        |
| Column heading: Enter or Space | Sorts by it                                                    |

## Styling

Every `--su-table-*` variable of [`@su-labs/table`](https://www.npmjs.com/package/@su-labs/table#variables) works here
too, so one theme styles both. The tree adds:

| Variable                                                                                                        | Default                                   |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `--su-tree-table-indent`                                                                                        | `1.25rem`, per level                      |
| `--su-tree-table-cell-start`                                                                                    | `0.4rem`, the first cell's start padding  |
| `--su-tree-table-toggle-size` / `--su-tree-table-toggle-gap` / `--su-tree-table-toggle-radius`                  | `1.5rem` / `0.25rem` / `6px`              |
| `--su-tree-table-toggle-color` / `--su-tree-table-toggle-hover-background`                                      | `inherit` / a soft tint of the text       |
| `--su-tree-table-group-background` / `--su-tree-table-group-color` / `--su-tree-table-group-font-weight`        | `rgb(0 0 0 / 0.04)` / `inherit` / `600`   |
| `--su-tree-table-number-color`                                                                                  | the text at 65%                           |
| `--su-tree-table-merged-background` / `--su-tree-table-merged-vertical-align` / `--su-tree-table-merged-border` | `transparent` / `middle` / the row border |

## Browser Compatibility

Uses `color-mix()` and `position: sticky`: Chrome, Edge, Firefox and Safari from 2023 on.
