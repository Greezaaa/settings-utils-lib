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

The `edit` action is handled by the table: it edits that row inline (Enter saves, Escape cancels). Selecting rows
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
| `columnControls` | `false` | A Columns button that opens a panel to pin or unpin each column |
| `labels` | English | `Partial<SuTableLabels>`: any text, e.g. in the page's language |

### Outputs

| Output | Payload |
|--------|---------|
| `edited` | `readonly TRow[]`: the saved rows in the API's shape |
| `reordered` | `{ ids, rows }`: every row in its new order |
| `action` | `{ id, rows }`: the clicked row, or the selected rows for a bulk action |
| `sortChange` | `{ key, direction } \| null` |
| `selectionChange` | `readonly TRow[]` |

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
columns scroll under it. With `columnControls`, people pin and unpin columns themselves from the Columns panel. If the
pinned columns would leave too little room for the rest, they stop sticking until there's room again.

## Keyboard

| Where | Key | Does |
|-------|-----|------|
| Column heading | Enter or Space | Sorts by it: ascending, descending, then unsorted |
| Move handle | Space or Enter | Picks the row up, then drops it |
| Move handle, row picked up | ↑ / ↓, Home / End | Moves it one place, or to the top or bottom |
| Move handle, row picked up | Escape or Tab | Puts it back where it was |
| Row being edited | Enter / Escape | Saves / cancels |

## Styling

Set the variables on `:root` (your theme) or on `su-lib-table`:

```css
su-lib-table {
  --su-table-border: 1px solid var(--border);
  --su-table-header-background: var(--surface);
  --su-table-accent: var(--accent);
}
```

| Variable | Default |
|----------|---------|
| `--su-table-font-family` / `--su-table-font-size` / `--su-table-text-color` | `inherit` / `0.95rem` / `inherit` |
| `--su-table-background` | `transparent` |
| `--su-table-border` / `--su-table-radius` | `1px solid rgb(0 0 0 / 0.12)` / `10px` |
| `--su-table-row-border` / `--su-table-cell-padding` | `1px solid rgb(0 0 0 / 0.08)` / `0.6rem 0.75rem` |
| `--su-table-header-background` / `--su-table-header-color` | a faint tint / `inherit` |
| `--su-table-row-header-weight` | `600` |
| `--su-table-hover-background` / `--su-table-selected-background` / `--su-table-editing-background` | faint tints |
| `--su-table-grabbed-background` / `--su-table-grabbed-outline` | blue tints |
| `--su-table-dragging-background` / `--su-table-dragging-shadow` | `Canvas` / `0 8px 24px rgb(0 0 0 / 0.18)` (the row being dragged) |
| `--su-table-pinned-background` / `--su-table-pinned-shadow` | `Canvas` / `rgb(0 0 0 / 0.14)` (pinned cells, and the shadow on their edge) |
| `--su-table-accent` | `#2563eb` (checkboxes) |
| `--su-table-button-background` / `--su-table-button-border` / `--su-table-button-color` | `transparent` / `1px solid rgb(0 0 0 / 0.2)` / `inherit` |
| `--su-table-button-radius` / `--su-table-button-padding` | `6px` / `0.3rem 0.7rem` |
| `--su-table-primary-background` / `--su-table-primary-color` | `#111` / `#fff` (Save) |
| `--su-table-danger-color` / `--su-table-danger-border` | `#b42318` / a soft red line |
| `--su-table-input-background` / `--su-table-input-border` / `--su-table-input-radius` | `transparent` / `1px solid rgb(0 0 0 / 0.25)` / `6px` |
| `--su-table-panel-background` | a faint tint (selection toolbar and bulk edit) |
| `--su-table-focus-outline` | `2px solid currentColor` |

## Browser Compatibility

Uses pointer events and `color-mix()`: Chrome, Edge, Firefox and Safari from 2023 on.
