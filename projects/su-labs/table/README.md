# Table

`@su-labs/table`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/table?style=for-the-badge)

Accessible data tables for Angular, mapped from your API's JSON with typed columns: sort, select, edit one row or many
at once, reorder by dragging or with the keyboard, and act on rows with your own buttons. Edited rows come back in the
API's own shape, ready to send.

> **Not using Angular?** The same table logic is in [`@su-labs/core/table`](https://www.npmjs.com/package/@su-labs/core).

## Features

- **Typed columns**: each column maps one field of your row type; its `format`, `sortable` and `edit` are typed by
  that field, with no `any`
- **Sorting**: ascending, descending, then back to the rows' own order; numbers, dates and text compare naturally
- **Editing**: one row inline, or many selected rows at once (only the fields you change are applied to all of them),
  with validation messages
- **Reordering**: drag the handle (mouse or touch), or with the keyboard: Space picks the row up, the arrows move it,
  Space drops it, Escape puts it back
- **Row actions**: edit, delete, duplicate… any button, hidden or disabled per row, and bulk actions for the selection
- **Accessible**: a real `<table>` with a caption and row headers, sort buttons with `aria-sort`, labelled checkboxes
  and handles, and every change announced to screen readers
- **Themeable**: every colour and spacing is a `--su-table-*` CSS variable

## Installation

```bash
npm install @su-labs/table
```

Peer dependencies: `@angular/core` and `@angular/common` 22.

## Quick Start

Describe your API's rows and map each field to a column:

```ts
import { suCheckboxEditor, suNumberEditor, suSelectEditor, SuTableAction, SuTableActionEvent, SuTableColumns, SuTableComponent, SuTableReorderEvent, suTextEditor } from '@su-labs/table';

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
  readonly admin: boolean;
  readonly status: 'active' | 'paused';
}

@Component({
  selector: 'app-users',
  imports: [SuTableComponent],
  template: `
    <su-lib-table
      caption="Users"
      selectable
      reorderable
      [columns]="columns"
      [rows]="users()"
      [rowId]="userId"
      [actions]="actions"
      (edited)="save($event)"
      (reordered)="reorder($event)"
      (action)="onAction($event)"
    />
  `,
})
export class UsersPage {
  protected readonly users = signal<readonly User[]>([]);
  protected readonly userId = (user: User) => user.id;

  protected readonly columns: SuTableColumns<User> = [
    { key: 'name', header: 'Name', sortable: true, edit: suTextEditor({ requiredMessage: 'Enter a name' }) },
    { key: 'age', header: 'Age', sortable: true, align: 'end', edit: suNumberEditor({ min: 0, max: 130 }) },
    { key: 'admin', header: 'Admin', edit: suCheckboxEditor() },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      format: (status) => (status === 'active' ? 'Active' : 'Paused'),
      edit: suSelectEditor([
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
      ]),
    },
  ];

  protected readonly actions: readonly SuTableAction<User>[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'delete', label: 'Delete', danger: true, bulk: true, disabled: (user) => user.admin },
  ];

  protected save(rows: readonly User[]): void {
    // PUT each row as it is; then update `users` with the API's answer
  }

  protected reorder({ rows }: SuTableReorderEvent<User>): void {
    this.users.set(rows);
  }

  protected onAction({ id, rows }: SuTableActionEvent<User>): void {
    // 'duplicate' or 'delete' for these rows (confirm a delete with @su-labs/dialog)
  }
}
```

The `edit` action is handled by the table: it edits that row inline (Enter saves, Escape cancels). A double-click on
an editable cell does the same, starting in that field (`editOnDoubleClick` turns it off); the Edit button stays as the
way in for keyboards. Selecting rows
shows a toolbar to edit them together or run the bulk actions.

### Custom cells

Put anything in a column's cells with a template; `suTableCellOf` only types the row:

```html
<su-lib-table caption="Users" [columns]="columns" [rows]="users()">
  <ng-template suTableCell="status" [suTableCellOf]="users()" let-user let-text="text">
    <span class="badge" [class.is-active]="user.status === 'active'">{{ text }}</span>
  </ng-template>
</su-lib-table>
```

## API

### Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `columns` | — | `SuTableColumns<TRow>`, one per field (see below) |
| `rows` | — | The rows, as the API sends them |
| `caption` | — | The table's name for screen readers |
| `showCaption` | `false` | Shows the caption on screen too |
| `rowId` | each row object | The row's identity, e.g. `(user) => user.id`; keeps the selection when new rows arrive |
| `actions` | `[]` | `SuTableAction<TRow>[]`, buttons on each row |
| `selectable` | `false` | Checkboxes to select rows, with a toolbar for the selection |
| `reorderable` | `false` | A move handle on each row |
| `columnControls` | `false` | A Columns button with a menu: search, Select all, a checkbox to show each column, and a toggle for the pin in its heading |
| `pageSize` | `'all'` | Rows per page |
| `pageSizes` | `[]` | Page sizes to choose from under the table, e.g. `[10, 25, 50, 'all']` |
| `maxHeight` | — | Any CSS length, e.g. `'28rem'`: the table scrolls inside, keeping the header and pinned rows in view |
| `editOnDoubleClick` | `true` | A double-click on an editable cell edits its row, starting in that field |
| `searchable` | `false` | A search box above the table that narrows the rows by their text |
| `rowPinning` | `false` | A Pin button on each row, keeping it above the others on every page |
| `pinnedRows` | — | The ids of the rows pinned to start with |
| `rowClass` | — | Extra classes for a row, e.g. `(row) => (row.active ? null : 'is-muted')` |
| `labels` | English | `Partial<SuTableLabels>`: any text, e.g. in the page's language |

### Outputs

| Output | Payload |
|--------|---------|
| `edited` | `readonly TRow[]`: the saved rows in the API's shape |
| `reordered` | `{ ids, rows }`: every row in its new order |
| `action` | `{ id, rows }`: the clicked row, or the selected rows for a bulk action |
| `sortChange` | `{ key, direction } \| null` |
| `selectionChange` | `readonly TRow[]` |
| `pageChange` | `{ page, pageSize }`, the page from 0 |
| `searchChange` | The query, once typing pauses |
| `columnsChange` | Every column's state (`{ key, header, visible, pinned }`) after a change in the Columns menu |
| `pinnedRowsChange` | The ids of the pinned rows, in pin order |

The table shows your changes right away; update `rows` with the API's answer to keep them, or to undo a failed save.

### Columns

| Field | Description |
|-------|-------------|
| `key` | The field in the row |
| `header` | The column's heading |
| `format(value, row)` | The cell's text; by default the value (booleans as Yes and No, nothing for null) |
| `sortable` | `true`, or how two values compare |
| `edit` | How the field is edited; without it the column is read-only |
| `validate(value, row)` | A message when an edited value isn't valid, or `null` |
| `align` | `'start'`, `'center'` or `'end'` |
| `pinned` | `'start'` or `'end'`: stays in view at that edge while the other columns scroll |
| `pinnable` | `true` to show the pin in its heading (default: only on pinned columns) |
| `searchable` | `false` to leave the column out of the search (default `true`) |
| `hidden` | `true` to start out of view; the field stays in the row data and comes back on save |

### Editors

| Editor | API value | Control |
|--------|-----------|---------|
| `suTextEditor({ input, requiredMessage, maxLength, placeholder })` | `string` (trimmed) | `text`, `email` or `textarea` |
| `suNumberEditor({ min, max, step, invalidMessage })` | `number` | `number` |
| `suCheckboxEditor()` | `boolean` | checkbox |
| `suDateEditor({ min, max })` | `string`, `YYYY-MM-DD` | date |
| `suSelectEditor([{ value, label }, …])` | one of the values | select |

Any other field gets its own `SuTableEditor<TValue>`: an `input`, `toInput(value)` for the control, `parse(input)`
back to the API value, and an optional `validate(value)`.

### Actions

| Field | Description |
|-------|-------------|
| `id` / `label` | `'edit'` edits the row inline; any other id is sent to `action` |
| `danger` | Styled as something that can't be undone |
| `bulk` | Also offered for the selected rows |
| `hidden(row)` / `disabled(row)` | Leaves the button out, or disables it, for a row |

## Pinned columns

Pin a column to keep it in view while the others scroll, e.g. the product name on a phone:

```ts
{ key: 'name', header: 'Product', pinned: 'start' },
{ key: 'price', header: 'Price', pinned: 'end' },
```

Pinned columns move to their edge in the order you list them. The move handles and checkboxes stay with the columns
pinned to the start, and the actions with those pinned to the end. A soft shadow shows on the pinned edge while other
columns scroll under it. Pinned columns, and columns marked `pinnable: true`, show a pin in their heading: tapping it pins or
unpins the column. The Columns menu (`columnControls`) chooses which headings show that pin. If the
pinned columns would leave too little room for the rest, they stop sticking until there's room again.

## Sticky header

Give the table a `maxHeight` and it scrolls inside that height, keeping the header at the top and the pinned rows just
under it, with a soft shadow once rows scroll beneath them:

```html
<su-lib-table caption="Products" [columns]="columns" [rows]="products()" maxHeight="28rem" />
```

Without a `maxHeight` the table grows with its rows and the page scrolls instead. A header can't stick to the page
itself while the table scrolls sideways, which it needs to do on narrow screens.

## Showing and hiding columns

Load all of the API's fields and show only some: `hidden: true` starts a column out of view, and with `columnControls`
the Columns menu has a checkbox for each column beside its pin choice. Hidden fields stay in each row, so a saved row
still comes back whole; they're left out of the search and the edit fields, and the last column on view can't be
hidden. Keep the layout with `columnsChange`.

## Search

`searchable` adds a search box above the table. It matches the text people see (so `€18.50` and `Garden` match, not
`18.5` and `garden`), ignores case and accents, and needs every word typed to match somewhere in the row. It runs once
typing pauses and announces how many rows match; Escape clears it. Pinned rows stay, the pages cover the matches, and
reordering is off while searching. Leave a column out with `searchable: false`.

## Pinned rows

With `rowPinning`, each row gets a Pin button. Pinned rows stay above the others on every page, in the order they were
pinned, and aren't counted in the pages or moved by sorting and reordering; unpinning puts a row back where it was.
Start with some pinned, and keep track of them, e.g. to save them:

```html
<su-lib-table … rowPinning [pinnedRows]="[103]" (pinnedRowsChange)="savePins($event)" />
```

## Pagination

```html
<su-lib-table caption="Products" [columns]="columns" [rows]="products()" [pageSize]="25" [pageSizes]="[10, 25, 50, 'all']" />
```

Under the table: a rows-per-page choice, the range on screen ("26–50 of 132") and previous and next buttons; each page
change is announced. Changing the page size keeps the first row on screen in view, sorting goes back to the first page,
and the select-all checkbox selects the rows of the page on screen while the selection is kept across pages.

## Keyboard

| Where | Key | Does |
|-------|-----|------|
| Column heading | Enter or Space | Sorts by it: ascending, descending, then unsorted |
| Move handle | Space or Enter | Picks the row up, then drops it |
| Move handle, row picked up | ↑ / ↓, Home / End | Moves it one place, or to the top or bottom |
| Move handle, row picked up | Escape or Tab | Puts it back where it was |
| Row being edited | Enter / Escape | Saves / cancels |

## Styling

Every colour, border, size and state is a CSS variable. Set them on `:root` (your theme), on `su-lib-table`, or on a
class for one table:

```css
su-lib-table {
  --su-table-header-background: #0f3d2e;
  --su-table-header-color: #d1fae5;
  --su-table-header-text-transform: uppercase;
  --su-table-stripe-background: rgb(16 185 129 / 0.06);
  --su-table-sorted-background: rgb(16 185 129 / 0.1);
  --su-table-drop-line-color: #10b981;
}
```

### Row states

`rowClass` adds your own classes to a row, e.g. to mark inactive rows. The table styles two of them:

```ts
rowClass = (user: User) => (user.active ? null : 'is-muted');
```

| Class | Variables |
|-------|-----------|
| `is-muted` | `--su-table-muted-background` (`transparent`), `--su-table-muted-text` (`55%`, how much of the text colour shows) |
| `is-highlighted` | `--su-table-highlight-background` (a soft amber tint) |

Other classes are yours to style from a global stylesheet.

### Variables

Defaults are in brackets; "tint" means the accent blue at a low opacity.

**Table**

| Variable | Default |
|----------|---------|
| `--su-table-font-family` / `--su-table-font-size` / `--su-table-text-color` | `inherit` / `0.95rem` / `inherit` |
| `--su-table-background` | `transparent` |
| `--su-table-border` / `--su-table-radius` | `1px solid rgb(0 0 0 / 0.12)` / `10px` |
| `--su-table-cell-padding` / `--su-table-cell-vertical-align` | `0.6rem 0.75rem` / `middle` |
| `--su-table-caption-color` / `--su-table-caption-font-size` | `inherit` |
| `--su-table-accent` | `#2563eb` (checkboxes, pressed pins) |
| `--su-table-checkbox-size` | `1rem` |
| `--su-table-focus-outline` | `2px solid currentColor` |

**Header**

| Variable | Default |
|----------|---------|
| `--su-table-header-background` / `--su-table-header-color` | a faint grey / `inherit` |
| `--su-table-header-font-size` / `--su-table-header-font-weight` | `inherit` / `600` |
| `--su-table-header-text-transform` / `--su-table-header-letter-spacing` | `none` / `normal` |
| `--su-table-header-padding` / `--su-table-header-border` | the cell padding / the row border |
| `--su-table-sticky-shadow` | `0 6px 8px -6px rgb(0 0 0 / 0.25)` (under a sticky header while rows scroll beneath) |

**Rows and cells**

| Variable | Default |
|----------|---------|
| `--su-table-row-background` / `--su-table-row-color` | `transparent` / `inherit` |
| `--su-table-stripe-background` | the row background (set it for striped rows) |
| `--su-table-row-border` / `--su-table-row-header-weight` | `1px solid rgb(0 0 0 / 0.08)` / `600` |
| `--su-table-hover-background` | a faint grey |
| `--su-table-selected-background` / `--su-table-selected-color` | a tint / `inherit` |
| `--su-table-sorted-background` | `transparent` (the sorted column's cells and heading) |
| `--su-table-editable-hover-background` | the text colour at 6% (an editable cell under the pointer) |
| `--su-table-editing-background` | a tint (the row being edited) |

**Reordering**

| Variable | Default |
|----------|---------|
| `--su-table-handle-color` | `inherit` |
| `--su-table-grabbed-background` / `--su-table-grabbed-outline` | a tint / `2px solid` blue at 60% |
| `--su-table-dragging-background` / `--su-table-dragging-shadow` | `Canvas` / `0 8px 24px rgb(0 0 0 / 0.18)` |
| `--su-table-drop-line-color` / `--su-table-drop-line-width` | `#2563eb` / `2px` (where the dragged row will land) |

**Pinned columns and rows**

| Variable | Default |
|----------|---------|
| `--su-table-pinned-background` | `Canvas` (behind pinned and sticky cells) |
| `--su-table-pinned-border` / `--su-table-pinned-shadow` | `1px solid rgb(0 0 0 / 0.14)` / `rgb(0 0 0 / 0.22)` |
| `--su-table-pinned-row-background` / `--su-table-pinned-row-border` | a tint / `2px solid` blue at 40% |

**Buttons, inputs and panels**

| Variable | Default |
|----------|---------|
| `--su-table-button-background` / `--su-table-button-border` / `--su-table-button-color` | `transparent` / `1px solid rgb(0 0 0 / 0.2)` / `inherit` |
| `--su-table-button-radius` / `--su-table-button-padding` | `6px` / `0.3rem 0.7rem` |
| `--su-table-primary-background` / `--su-table-primary-color` | `#111` / `#fff` (Save) |
| `--su-table-danger-color` / `--su-table-danger-border` | `#b42318` / a soft red line |
| `--su-table-input-background` / `--su-table-input-border` / `--su-table-input-radius` | `transparent` / `1px solid rgb(0 0 0 / 0.25)` / `6px` |
| `--su-table-panel-background` | a faint grey (selection toolbar and bulk edit) |
| `--su-table-menu-background` / `--su-table-menu-shadow` | `Canvas` / `0 12px 32px rgb(0 0 0 / 0.18)` (the Columns menu) |

## Browser Compatibility

Uses pointer events and `color-mix()`: Chrome, Edge, Firefox and Safari from 2023 on.
