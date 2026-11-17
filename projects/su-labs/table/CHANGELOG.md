# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.1.4] - 2026-11-17

### Changed
- Uses `@su-labs/core` 1.11.0 (was 1.10.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.3] - 2026-11-17

### Changed
- Uses `@su-labs/core` 1.10.0 (was 1.9.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.2] - 2026-11-16

### Changed
- Uses `@su-labs/core` 1.9.0 (was 1.8.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.1] - 2026-11-15

### Fixed
- The heading pin of a column set up with `pinned: 'end'` pins it back to the end instead of the start

## [22.1.0]

### Added
- Pinned columns: `pinned: 'start' | 'end'` on a column keeps it in view while the others scroll, with a soft shadow on its edge while columns pass under it; the move handles and checkboxes stay with columns pinned to the start, the actions with those pinned to the end
- A pin in the heading of pinned and pinnable columns (`pinnable: true`) pins the column to the start or unpins it (a toggle, announced)
- `columnControls`: a Columns button with a menu to show, hide, pin and unpin columns: a search for long lists, a Select all checkbox (partly checked while some columns are hidden), a checkbox for each column and a toggle beside it that shows or hides the column's heading pin; Escape or a click outside closes it
- When the pinned columns would leave too little room to scroll the rest (e.g. on a phone), they stop sticking until there's room
- `--su-table-pinned-background` and `--su-table-pinned-shadow`
- Pinned columns show a pin in their heading and a thin line on their edge, so they read as pinned before anything scrolls; `--su-table-pinned-border`
- Pagination: `pageSize` and `pageSizes` show the rows a page at a time, with a paginator under the table (rows per page, the range on screen, previous and next, announced); `pageChange` emits `{ page, pageSize }`
- The select-all checkbox selects the rows of the current page; the selection is kept across pages
- Pinned rows: `rowPinning` adds a Pin button to each row (a toggle, announced) that keeps it above the others on every page, tinted and set off by a line; `pinnedRows` sets the starting pins and `pinnedRowsChange` emits their ids
- `--su-table-pinned-row-background` and `--su-table-pinned-row-border`
- Search: `searchable` adds a search box above the table that narrows the rows by the text they show, ignoring case and accents (every word must match), once typing pauses; the number of matches is announced, Escape clears it, pinned rows stay, and reordering is off meanwhile; `searchChange` emits the query
- The search box and the Columns button share a bar above the table
- Show and hide columns: `hidden: true` starts a column out of view (its field stays in the row data and comes back on save), with a checkbox for each column in the Columns menu; the last column on view stays shown, and hidden columns are left out of the search
- Sticky headers: `maxHeight` (any CSS length) lets the table scroll inside; the header stays at the top and the pinned rows stay under it, with a soft shadow while rows scroll beneath; `--su-table-sticky-shadow`
- Double-click editing: a double-click on an editable cell edits its row, starting in that field with its text selected; while a row is being edited, a double-click elsewhere never drops its changes. `editOnDoubleClick` turns it off. Without other actions, an actions column shows for Save and Cancel while a row is edited
- Theming: CSS variables for the header (font size and weight, letter spacing, text transform, padding, border), rows (background, text colour, stripes), the selected row's text, the sorted column, hovered editable cells, the caption, checkbox size, the move handle and a drop line showing where a dragged row will land (`--su-table-drop-line-color`, `--su-table-drop-line-width`)
- `rowClass` adds your own classes to rows; `is-muted` and `is-highlighted` come styled, with their own variables
- `columnsChange` emits every column's state (`SuTableColumnState`: shown, pinned) after a change in the Columns menu, e.g. to save it

### Changed
- The cell that heads each row is a `<td role="rowheader">` instead of a `<th scope="row">`, styled through `.su-table-row-header` and `--su-table-row-header-weight`

### Fixed
- The table shrinks to fit inside grid and flex layouts, scrolling its columns instead of widening the page

## [22.0.0]

### Added
- `<su-lib-table>`: an accessible data table over typed columns (`SuTableColumns<TRow>`), with `caption`, `rowId`, `actions`, `selectable`, `reorderable` and `labels`
- Sorting from the column headings, with `aria-sort`
- Selection with checkboxes, and a toolbar to edit the selected rows together, run bulk actions or clear the selection
- Inline editing of one row (the `edit` action) and bulk editing of many, with validation messages; `edited` emits the saved rows in the API's shape
- Reordering by dragging the handle (mouse or touch; the row follows the pointer and the others slide aside to open its place) or with the keyboard; `reordered` emits the new order
- Row actions, hidden or disabled per row; `action` emits the clicked or selected rows
- `suTableCell` templates for custom cells
- Every change announced to screen readers, every text replaceable with `labels`
- Every part themeable with `--su-table-*` CSS variables
- Depends on exactly `@su-labs/core` 1.7.0 (version 22 follows Angular 22)
