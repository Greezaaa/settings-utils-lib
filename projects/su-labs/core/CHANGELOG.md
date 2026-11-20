# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `@su-labs/core/theme`: four palettes, `violet` (porcelain, taupe, ultra violet), `volt` (aubergine, almond cream, volt green), `klein` (Klein blue, chalk white, papaya orange) and `cobalt` (butterscotch gold, graphite ink, hyper cobalt)

## [1.13.0] - 2026-11-18

### Added
- `@su-labs/core/select`: `SuSelectController` for a select following the WAI-ARIA listbox pattern: `open`, `close`, `toggle`, `move` (`next`, `previous`, `first`, `last`, skipping disabled options), `activate`, `choose`, `search` (ignoring case and accents), `typeAhead` (choosing at once while closed, like a native select), `setOptions`, `setValue` and `selected`, with `typeAheadDelay` and `compare` options; `suSelectGroups` for options under group headings; `suSelectFilter`, `suSelectNormalize`; `SU_SELECT_LABELS`

## [1.12.0] - 2026-11-18

### Added
- `@su-labs/core/tooltip`: `SuTooltipController` for whether a tooltip is open, with `show` and `hide` after `showDelay` and `hideDelay` (a pointer only passing over doesn't open it, one moving to the tooltip doesn't close it), `open`, `close`, `toggle`, `setOpen`, `setDelays` and `cancel`; `suTooltipPosition` for a tooltip beside its trigger (12 placements, moving to the other side when only that has room, kept inside the viewport, right to left aware) with where its arrow points and the point it grows from; `suTooltipIconPosition` and `suTooltipIconClip` for a tooltip that grows out of an icon; `suTooltipPlacementParts`; `SU_TOOLTIP_LABELS`

## [1.11.0] - 2026-11-17

### Added
- `@su-labs/core/tree-table`: `SuTreeTableController` for rows with child rows: data parents or group rows across the table (`rowKind`, `groupLabel`), `toggle`, `setAllExpanded`, `isExpanded`, `expandedIds` and the `expanded` option; numbering per parent (`numbering`: `nested`, `restart` or `continue`) with `unnumbered` rows; merged cells from a column's `span` (`rowSpan`, `colSpan`); sorting within each parent, a search that keeps a match's parents open, paging by top-level rows, pinned top-level rows with their children, the table's column visibility and pins; `rowKey` for treegrid keyboard moves; `SU_TREE_TABLE_LABELS`
- `@su-labs/core/stepper`: a step's `completed` option shows it as completed from outside, e.g. for work saved earlier
- `@su-labs/core/table`: the pieces both tables share, `suResolveTableColumn`, `SuTableColumnLayout`, `suSearchTerms`, `suNormalizeText`, `suPageBounds`, `suNormalizePageSize` and `suPinOffsets`; `SuTableController` works as before

## [1.10.0] - 2026-11-17

### Added
- `@su-labs/core/stepper`: `SuStepperController` for content split into steps shown one at a time, with each step's rules for going forward (`canNext`) and back (`canBack`), disabled steps that moves skip, jumps that check every step they pass (`goTo`, `canGoTo`), a `linear` option, `next`, `back`, `select`, `setSteps`, `reset`, the visited and completed steps in `state`, and replaceable `SU_STEPPER_LABELS`

## [1.9.0] - 2026-11-15

### Added
- `@su-labs/core/skeleton.css`: skeleton loaders drawn with your own HTML and CSS inside `.su-skeleton`, with one shimmer across every shape, `su-skeleton-layout` for wrappers that only lay shapes out, `--su-skeleton-*` variables, and no shimmer when less motion is asked for
- `@su-labs/core/skeleton`: `setSuSkeletonBusy(region, busy)` sets `aria-busy` and `aria-live="polite"` on the loading region

## [1.8.0] - 2026-11-14

### Added
- Pinned columns in `@su-labs/core/table`: `pinned: 'start' | 'end'` on a column (`SuTablePin`), `pinColumn(key, pin)` to change it, announced; `state.columns` lists pinned columns first or last with their `pinned` side, and `state.rowHeaderKey` names the field that heads each row wherever it's pinned
- Pagination: `pageSize` and `pageSizes` options (`SuTablePageSize`), `setPage(page)` and `setPageSize(size)` (keeping the first row on screen in view), announced; `state.rows` holds the current page and `state.pagination` its page, page count, sizes and range
- A row moved with the keyboard takes the page with it; a dropped row moves within the current page
- Pinned rows: `pinRow(id, pinned?)` and the `pinnedRows` option keep rows above the others on every page, outside the paging and the sort, announced; `state.pinnedRows` lists them and each row has `pinned`. Pinned rows don't move, and unpinning puts a row back where it was
- Search: `search(query)` keeps the rows whose shown text, in the searchable columns, holds every word of the query, ignoring case and accents; announced, with `searchable: false` to leave a column out; `state.query` and `state.searching`, pinned rows stay and reordering is off while searching
- Column visibility: `hidden: true` on a column and `setColumnVisible(key, visible)`, announced; hidden fields stay in the row data, out of the cells, edit fields and search, and the last column on view stays shown. `state.allColumns` lists every column in set-up order with whether it's shown and where it's pinned (`SuTableColumnState`), for a column menu; `setColumnsVisible(visible)` shows every column, or hides all but the first one on view
- Pinnable columns: `pinnable` on a column and `setColumnPinnable(key, pinnable)` say whether its heading shows a pin to pin and unpin it (by default only pinned columns); taking the pin away unpins the column. `pinnable` is in `state.columns` and `state.allColumns`

### Changed
- `selectAll()` selects the rows on screen: the pinned ones and the current page (every row without pagination), and `selectedIds` lists the selected rows on every page

## [1.7.0] - 2026-11-14

### Added
- `@su-labs/core/table`: `SuTableController` for data tables from API rows, with typed columns (`SuTableColumns<TRow>`), sorting, selection, reordering by pointer or keyboard (`move`, `moveKey`), row and bulk actions, and editing of one row or many at once that returns the rows in the API's shape (`startEdit`, `setDraft`, `save`); ready-made editors (`suTextEditor`, `suNumberEditor`, `suCheckboxEditor`, `suDateEditor`, `suSelectEditor`), announcements for screen readers and replaceable `SU_TABLE_LABELS`

## [1.6.0] - 2026-11-11

### Added
- Ready-made palettes in `@su-labs/core/theme`: `SU_THEME_PALETTES` (11, listed in `SU_PALETTE_NAMES`), each light or dark (`SuThemeScheme`) with its `--su-theme-*` variables, including `button-text` for text on the accent; checked for readable text and button text
- `palettes` theme option: the palettes a site offers as themes, none by default; only those can be set or restored from storage, so sites sharing one saved choice can offer different sets
- `availableThemes()` and `isAvailable()` on `SuThemeController`; `SU_BASE_THEME_NAMES` and `isSuBaseThemeName()`
- A `data-theme-scheme` attribute (`light` or `dark`) beside `data-theme`, so a site's own colours can follow any theme

### Fixed
- Switching themes no longer keeps a CSS variable the new theme doesn't set

## [1.5.0] - 2026-11-09

### Added
- `size` option for dialogs (`SuDialogSize`: `'small'`, `'medium'`, `'large'`, default `'small'`): how tall a dialog is at least, growing with its content

## [1.4.0] - 2026-11-09

### Added
- `@su-labs/core/dialog`: `SuDialogController` for confirm and message dialogs, one at a time, each answered with a promise (`confirm`, `alert`, `open`, `close`, `configure`), with HTML text, an optional picture, button labels, size, a dimmed or clear backdrop (`backdrop`, `backdropColor`, `backdropOpacity`), `dismissible` and `danger`

## [1.3.0] - 2026-11-07

### Added
- A notification `message` can be a list of pieces (`SuNotificationMessagePart`): text and links (`label`, `onClick`, `dismiss`), so part of the message itself opens something

## [1.2.0] - 2026-11-07

### Added
- `actions` option for `SuNotificationController` notifications (`SuNotificationAction`: `label`, `onClick`, `dismiss`), kept on each notification for your markup to render
- `slideFrom` option and store for `SuNotificationController` (`'auto'` by default): the direction notifications slide in from

## [1.1.0] - 2026-11-07

### Added
- `SuStorage`: the storage interface the utilities save to (`getItem`, `setItem`, `removeItem`); `localStorage` fits as is
- `createSuCookieStorage({ domain, maxAgeDays })`: saves values in cookies so sites on the same parent domain share them; the domain is only used when the page is on it, so `localhost` keeps working
- `getSuLocalStorage()`: `localStorage` in a browser, `null` elsewhere
- `storage` option for `SuThemeController` and `SuFontSizeController` (default: `localStorage`)
- `target` option for `SuThemeController`: the element the theme is applied to (default: `<html>`), to theme one part of a page

### Changed
- Package homepage now points to the website with a live demo

## [1.0.0] - 2026-11-05

First stable release. Every @su-labs utility is now available without Angular.

### Added
- `createSuStore`: minimal reactive store compatible with the Svelte store contract and React `useSyncExternalStore`
- `isBrowser`: environment check used to keep utilities safe in Node and during SSR
- `@su-labs/core/theme`: framework-agnostic `SuThemeController` (moved from `@su-labs/theme`)
- `@su-labs/core/font-size`: framework-agnostic `SuFontSizeController` (moved from `@su-labs/font-size`)
- `@su-labs/core/notifications`: framework-agnostic `SuNotificationController` and `isSuNotificationImageIcon` (moved from `@su-labs/notifications`)
- `@su-labs/core/scroll-spy`: framework-agnostic `SuScrollSpyController` and `observeSuScrollSpySection` (moved from `@su-labs/scroll-spy`)
- `@su-labs/core/visit-tracker`: framework-agnostic `SuVisitTrackerController` (moved from `@su-labs/visit-tracker`)
