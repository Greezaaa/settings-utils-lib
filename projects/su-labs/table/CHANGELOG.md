# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Pinned columns: `pinned: 'start' | 'end'` on a column keeps it in view while the others scroll, with a soft shadow on its edge while columns pass under it; the move handles and checkboxes stay with columns pinned to the start, the actions with those pinned to the end
- `columnControls`: a Columns button that opens a panel to pin or unpin each column
- When the pinned columns would leave too little room to scroll the rest (e.g. on a phone), they stop sticking until there's room
- `--su-table-pinned-background` and `--su-table-pinned-shadow`
- Pagination: `pageSize` and `pageSizes` show the rows a page at a time, with a paginator under the table (rows per page, the range on screen, previous and next, announced); `pageChange` emits `{ page, pageSize }`
- The select-all checkbox selects the rows of the current page; the selection is kept across pages
- Pinned rows: `rowPinning` adds a Pin button to each row (a toggle, announced) that keeps it above the others on every page, tinted and set off by a line; `pinnedRows` sets the starting pins and `pinnedRowsChange` emits their ids
- `--su-table-pinned-row-background` and `--su-table-pinned-row-border`
- Search: `searchable` adds a search box above the table that narrows the rows by the text they show, ignoring case and accents (every word must match), once typing pauses; the number of matches is announced, Escape clears it, pinned rows stay, and reordering is off meanwhile; `searchChange` emits the query
- The search box and the Columns button share a bar above the table
- Show and hide columns: `hidden: true` starts a column out of view (its field stays in the row data and comes back on save), and the Columns panel has a checkbox to show each column beside its pin choice; the last column on view stays shown, and hidden columns are left out of the search
- Sticky headers: `maxHeight` (any CSS length) lets the table scroll inside; the header stays at the top and the pinned rows stay under it, with a soft shadow while rows scroll beneath; `--su-table-sticky-shadow`
- `columnsChange` emits every column's state (`SuTableColumnState`: shown, pinned) after a change in the Columns panel, e.g. to save it

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
