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
