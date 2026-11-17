# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.0.0] - 2026-11-17

### Added

- `su-lib-tree-table`: rows with child rows (`children`) that open and close, with a button or the keyboard; `expanded` to start open, and `toggled` with every open row's id
- Data parents (a normal row with its own cells) and group rows (`rowKind`, `groupLabel`): a heading across the table over its children
- `numbered`: a first column with each row's number, `nested` (1.1, 1.2), `restart` or `continue` per parent (`numbering`), and `unnumbered` rows that don't count, e.g. group rows
- Merged cells: a column's `span(value, row)` returns `{ rows, columns }`, rendered as real `rowspan` and `colspan` cells
- The table's sorting (siblings within each parent), search (a match keeps its parents open on view), paging by top-level rows, pinned top-level rows with their children (`rowPinning`, `pinnedRows`), pinned columns, the Columns menu (`columnControls`), the sticky header (`maxHeight`), custom cells (`suTableCell`), `rowClass` and every `--su-table-*` variable, plus `--su-tree-table-*` ones for the tree
- `role="treegrid"` with `aria-level`, `aria-expanded`, `aria-setsize` and `aria-posinset`; one row in the tab order, the up and down arrows, Home and End move between rows, the right arrow opens a row or moves to its first child, the left arrow closes it or moves to its parent, Enter and Space open or close it
- `labels` to replace the texts (`SU_TREE_TABLE_LABELS`)
