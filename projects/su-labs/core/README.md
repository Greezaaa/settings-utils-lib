# @su-labs/core

![npm](https://img.shields.io/npm/v/@su-labs/core?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Framework-agnostic browser utilities with a tiny reactive store. Use them from vanilla JavaScript, React, Vue, Svelte, Angular or any other framework. No dependencies besides `tslib`.

> Using Angular? [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme), [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size), [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications), [@su-labs/dialog](https://www.npmjs.com/package/@su-labs/dialog), [@su-labs/table](https://www.npmjs.com/package/@su-labs/table), [@su-labs/tree-table](https://www.npmjs.com/package/@su-labs/tree-table), [@su-labs/skeleton](https://www.npmjs.com/package/@su-labs/skeleton), [@su-labs/stepper](https://www.npmjs.com/package/@su-labs/stepper), [@su-labs/tooltip](https://www.npmjs.com/package/@su-labs/tooltip), [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) and [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker) wrap these utilities in Angular services, components and directives with signals.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Entry Points](#entry-points)
- [Reactive Stores](#reactive-stores)
- [Theme](#theme)
- [Font Size](#font-size)
- [Notifications](#notifications)
- [Dialog](#dialog)
- [Table](#table)
- [Tree Table](#tree-table)
- [Skeleton](#skeleton)
- [Stepper](#stepper)
- [Tooltip](#tooltip)
- [Scroll Spy](#scroll-spy)
- [Visit Tracker](#visit-tracker)
- [Storage](#storage)
- [License](#license)

## Installation

```bash
npm install @su-labs/core
```

## Getting Started

Pick the guide for your environment. Each one covers installation, setup and usage:

| Environment | Guide |
|-------------|-------|
| Vanilla JavaScript (bundler or CDN, no build step) | [Vanilla JS guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/vanilla.md) |
| React (Vite, Next.js, Remix, …) | [React guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/react.md) |
| Svelte and SvelteKit | [Svelte guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/svelte.md) |
| Vue 3 and Nuxt | [Vue guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/vue.md) |
| Angular | [Angular guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/angular.md) (uses the Angular packages) |
| Node.js and server-side rendering | [Node guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/node.md) |

## Entry Points

Each utility has its own entry point, so your bundle only includes what you import.

| Import | Contents |
|--------|----------|
| `@su-labs/core` | `createSuStore`, `isBrowser` |
| `@su-labs/core/theme` | `SuThemeController` and theme types |
| `@su-labs/core/font-size` | `SuFontSizeController` and font size types |
| `@su-labs/core/notifications` | `SuNotificationController`, `isSuNotificationImageIcon` and notification types |
| `@su-labs/core/dialog` | `SuDialogController`, `suDialogBackdropColor` and dialog types |
| `@su-labs/core/table` | `SuTableController`, the editors (`suTextEditor`, `suNumberEditor`, …), `SU_TABLE_LABELS` and table types |
| `@su-labs/core/tree-table` | `SuTreeTableController`, `SU_TREE_TABLE_LABELS` and tree table types |
| `@su-labs/core/skeleton` | `setSuSkeletonBusy` |
| `@su-labs/core/skeleton.css` | The skeleton stylesheet |
| `@su-labs/core/stepper` | `SuStepperController`, `SU_STEPPER_LABELS` and stepper types |
| `@su-labs/core/tooltip` | `SuTooltipController`, `suTooltipPosition`, `suTooltipIconPosition`, `suTooltipIconClip`, `SU_TOOLTIP_LABELS` and tooltip types |
| `@su-labs/core/scroll-spy` | `SuScrollSpyController`, `observeSuScrollSpySection` |
| `@su-labs/core/visit-tracker` | `SuVisitTrackerController` and visit types |

## Reactive Stores

Every utility exposes its state as a store with two methods:

| Method | Description |
|--------|-------------|
| `get()` | Returns the current value |
| `subscribe(listener)` | Calls `listener` immediately with the current value, then on every change. Returns an unsubscribe function. |

This shape follows the Svelte store contract and plugs directly into React's `useSyncExternalStore`, so no adapter library is needed.

You can create your own stores too:

```ts
import { createSuStore } from '@su-labs/core';

const counter = createSuStore(0);
const unsubscribe = counter.subscribe((value) => console.log(value)); // logs 0
counter.set(1); // logs 1
unsubscribe();
```

## Theme

Manages light, dark, contrast and custom themes, follows the operating system's `prefers-color-scheme` when set to `'system'`, applies a `data-theme` attribute and CSS variables to `<html>` (or a `target` element), and saves the user's choice in `localStorage` (or another [storage](#storage)).

```ts
import { SuThemeController } from '@su-labs/core/theme';

const theme = new SuThemeController();
theme.init({ defaultTheme: 'system' });

theme.theme.subscribe((name) => console.log('Active theme:', name));
theme.setTheme('dark');
```

### API

| Member | Description |
|--------|-------------|
| `init(config?)` | Applies configuration and the saved or default theme |
| `setTheme(theme, persist = true)` | Sets `'light'`, `'dark'`, `'contrast'`, `'custom'` or `'system'` |
| `getTheme()` | Returns the resolved theme (never `'system'`) |
| `getUserPreference()` | Returns the user's choice (may be `'system'`) |
| `theme` | Read-only store of the resolved theme |
| `destroy()` | Stops listening to system theme changes |

### Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `defaultTheme` | `'system'` | Theme used when nothing is saved |
| `storageKey` | `'su:theme'` | Key the choice is saved under |
| `storage` | `localStorage` | Where the choice is saved, see [Storage](#storage) |
| `target` | `<html>` | Element the theme is applied to; pass a component's element to theme only that part of the page |
| `cssVarPrefix` | `'--su-theme-'` | Prefix for the CSS variables |
| `themes` | — | Per-theme CSS variable overrides, e.g. `{ dark: { background: '#000' } }` |

### CSS Variables

```css
body {
  color: var(--su-theme-color);
  background: var(--su-theme-background);
}

a {
  color: var(--su-theme-main-accent);
}
```

## Font Size

Lets users make text bigger or smaller within set limits. The size is applied in pixels to a CSS custom property on `<html>` and saved in `localStorage` (or another [storage](#storage)).

```ts
import { SuFontSizeController } from '@su-labs/core/font-size';

const fontSize = new SuFontSizeController();
fontSize.configure({ minSize: 12, maxSize: 24 }); // optional
fontSize.init();

fontSize.increase();
fontSize.fontSize.subscribe((size) => console.log(`${size}px`));
```

```css
html {
  font-size: var(--base-font-size);
}
```

### API

| Member | Description |
|--------|-------------|
| `configure(config?)` | Updates limits, step, storage key or CSS variable name. Omitted values keep their current setting. |
| `init()` | Loads the saved size (or the default), clamps it and applies it. Call once at startup, after `configure()`. |
| `setFontSize(size)` | Sets, applies and saves a size, clamped to the limits |
| `increase(step?)` / `decrease(step?)` | Changes the size by `step` pixels (defaults to the configured step) |
| `reset()` | Returns to the default size and removes the saved value |
| `fontSize` | Read-only store of the current size in pixels |
| `limits` | Read-only store of `{ defaultSize, minSize, maxSize, step }` |

To disable controls at the edges, compare the two stores, for example `fontSize.get() === limits.get().maxSize`.

### Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `defaultSize` | `14` | Size used before the user picks one, and after `reset()` |
| `minSize` | `10` | Smallest allowed size |
| `maxSize` | `22` | Largest allowed size |
| `step` | `2` | Pixels added or removed by `increase()` / `decrease()` |
| `storageKey` | `'su:font-size'` | Key the size is saved under |
| `storage` | `localStorage` | Where the size is saved, see [Storage](#storage) |
| `cssVarName` | `'--base-font-size'` | CSS custom property set on `<html>` |

Invalid combinations are corrected: a maximum below the minimum is raised to the minimum, the default is clamped to the range, and a step of zero or less becomes `1`.

## Notifications

Manages a list of toast notifications: adding, dismissing, closing them automatically after a delay, and the screen position they appear in. It holds the state only; your app renders the list with its own markup and styles (see the [guides](#getting-started) for examples).

```ts
import { SuNotificationController } from '@su-labs/core/notifications';

const notifications = new SuNotificationController();

notifications.notifications.subscribe((list) => console.log(list.length, 'open'));
const id = notifications.show({ type: 'success', message: 'Saved!' });
notifications.dismiss(id);
```

### API

| Member | Description |
|--------|-------------|
| `show(options)` | Adds a notification and returns its ID |
| `dismiss(id)` | Removes one notification |
| `clearAll()` | Removes all notifications |
| `configure({ position, slideFrom })` | Sets where notifications appear, and the direction they slide in from (`'auto'`, `'left'`, `'right'`, `'top'`, `'bottom'`) |
| `notifications` | Read-only store of the active notifications, oldest first |
| `position` | Read-only store of the position (default `'top-right'`) |
| `slideFrom` | Read-only store of the slide direction (default `'auto'`: the side they sit on) |
| `destroy()` | Removes all notifications and cancels pending timers |

`isSuNotificationImageIcon(icon)` tells you whether a string icon is an image path or URL (render with `<img>`) or inline SVG markup (render as HTML).

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `type` | — | `'info'`, `'success'`, `'warning'`, `'error'` or `'custom'` |
| `message` | — | Text to display |
| `duration` | `3000` | Milliseconds before closing automatically |
| `autoClose` | `true` | Whether to close automatically after `duration` |
| `cssClass` | — | Extra CSS class(es) for custom styling |
| `icon` | `true` | `true` for the type's default icon, `false` for none, or an image URL or inline SVG string |
| `actions` | — | Buttons under the message: `{ label, onClick, dismiss? }`. Your markup renders them, calls `onClick`, then `dismiss(id)` unless `dismiss` is `false` |

Positions: `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'`.

## Dialog

Confirm and message dialogs: one on screen at a time (the others wait their turn), each answered with a promise. It holds the state only; your app renders the dialog, ideally with the native `<dialog>` element (Angular: [`@su-labs/dialog`](https://www.npmjs.com/package/@su-labs/dialog)).

```ts
import { SuDialogController } from '@su-labs/core/dialog';

const dialogs = new SuDialogController();
dialogs.configure({ acceptLabel: 'Delete', cancelLabel: 'Keep' });

dialogs.current.subscribe((dialog) => render(dialog)); // null when nothing is on screen
if (await dialogs.confirm({ title: 'Delete your results?', danger: true })) {
  // …
}
// Your markup calls dialogs.close(true) for accept, dialogs.close(false) for cancel, Escape or a click outside
```

### API

| Member | Description |
|--------|-------------|
| `confirm(options)` | Accept and cancel buttons; resolves with `true` when accepted |
| `alert(options)` | One button; resolves when closed |
| `open(options)` | Either, by `kind` (`'confirm'` or `'ok'`) |
| `close(accepted)` | Closes the dialog on screen with its answer and shows the next one |
| `configure(config)` | Defaults for every dialog from now on (any option below but the text) |
| `current` | Read-only store of the dialog on screen, or `null` |
| `destroy()` | Closes every dialog as cancelled |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `title` | — | The heading |
| `body` | — | Text under it; may be HTML (lists, `<small>`, links, images). Sanitize it when you render it |
| `image` | — | `{ src, alt }`, a picture above the text |
| `acceptLabel` / `cancelLabel` | `'OK'` / `'Cancel'` | Button labels |
| `danger` | `false` | The accept button warns of something that can't be undone |
| `size` | `'small'` | How tall it is at least, growing with its content: `'small'`, `'medium'` or `'large'` |
| `width` / `height` | from the stylesheet | Any CSS length |
| `backdrop` | `'dim'` | `'dim'` tints the page behind, `'none'` leaves it clear |
| `backdropColor` / `backdropOpacity` | from the stylesheet | The tint's colour and how much it covers (0 to 1); `current.backdropColor` is ready for CSS |
| `dismissible` | `true` | Whether Escape and a click outside close it as cancel |
| `cssClass` | — | Extra class, to style one dialog its own way |

## Table

A data table's state, from your API's JSON: typed columns map each field to a cell, with sorting, selection,
reordering, editing (one row, or many at once), paging, search, pinned rows and columns, and columns to show or hide,
all in one `state` store. Edited rows come back in the API's own
shape. Your app renders the table (Angular: [`@su-labs/table`](https://www.npmjs.com/package/@su-labs/table)).

```ts
import { suNumberEditor, SuTableColumns, SuTableController, suTextEditor } from '@su-labs/core/table';

interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
}

const columns: SuTableColumns<User> = [
  { key: 'name', header: 'Name', sortable: true, edit: suTextEditor({ requiredMessage: 'Enter a name' }) },
  { key: 'age', header: 'Age', sortable: true, format: (age) => `${age} years`, edit: suNumberEditor({ min: 0 }) },
];

const table = new SuTableController<User>({ columns, rowId: (user) => user.id, rows: await fetchUsers() });
table.state.subscribe((state) => render(state)); // columns, rows (with their cell texts), draft, announcement…

table.sortBy('age');
table.startEdit([2]);
table.setDraft('age', '33'); // the control's value, as typed
const result = table.save();
if (result.ok) {
  await saveUsers(result.rows); // [{ id: 2, name: '…', age: 33 }]
}
```

Render the table as a `<table>` with a caption, put `aria-sort` on sorted headings (`column.sort`), and read
`state.announcement` out in a live region (`role="status"`).

### API

| Member | Description |
|--------|-------------|
| `state` | Read-only store of everything to render: `columns`, `rows` (the current page), `pinnedRows`, `allColumns`, `pagination`, `query`, `searching`, `sort`, `selectedIds`, `selection`, `bulkActions`, `editable`, `draft`, `grabbedId`, `announcement` |
| `configure(options)` | Changes the `columns`, `rowId`, `actions`, `labels`, `pageSize`, `pageSizes` or `pinnedRows` |
| `setRows(rows)` | New rows, e.g. the API's answer; the selection keeps the rows still there |
| `sortBy(key)` | Ascending, then descending, then the rows' own order |
| `select(id, selected?)` / `selectAll(selected?)` / `clearSelection()` | Selection; without `selected`, toggles; `selectAll` works on the current page, `clearSelection` on every page |
| `selectedRows()` / `rowsOf(ids)` / `idOf(row)` | The rows behind ids, in display order |
| `move(id, toIndex)` | Moves a row, e.g. on a drop; returns the new order of ids, or `null` |
| `moveKey(id, key)` | Keyboard moves on a row's handle: Space or Enter picks up and drops, arrows, Home and End move, Escape or Tab put back; returns `{ handled, order }` |
| `grab(id)` / `moveGrabbed(offset)` / `drop()` / `cancelMove()` | The same moves, one by one |
| `startEdit(ids?)` | Edits these rows (by default the selected ones); many rows apply only the changed fields to all |
| `setDraft(key, value)` | A field's value as typed in its control (`string`, or `boolean` for a checkbox) |
| `save()` | `{ ok: true, rows }` with the edited rows in the API's shape, or `{ ok: false, errors }` |
| `cancelEdit()` | Stops editing |
| `setColumnPinnable(key, pinnable)` | Shows or hides the pin in a column's heading; taking it away unpins the column |
| `setColumnsVisible(visible)` | Shows every column, or hides all but the first one on view (a Select all checkbox) |
| `setColumnVisible(key, visible)` | Shows or hides a column; its field stays in the row data, and the last column on view stays shown |
| `pinColumn(key, pin)` | Pins a column to `'start'` or `'end'`, or unpins it with `null` |
| `search(query)` | Keeps the rows whose shown text holds every word of the query (case and accents ignored); `''` clears it |
| `pinRow(id, pinned?)` | Pins a row above the others on every page, or unpins it; without `pinned`, toggles. Start with the `pinnedRows` option |
| `setPage(page)` / `setPageSize(size)` | Shows a page (from 0), or changes the rows per page (a number or `'all'`) keeping the first row in view; set them up with the `pageSize` and `pageSizes` options |

`suTableDropIndex(pointerY, rowMiddles, fromIndex)` gives where a row dragged with the pointer lands, and
`suCompareValues(a, b)` is the default comparison.

### Columns and editors

| Column field | Description |
|--------------|-------------|
| `key` / `header` | The field in the row, and the heading |
| `format(value, row)` | The cell's text; by default the value (booleans as the `yes` and `no` labels) |
| `sortable` | `true`, or how two values compare |
| `edit` | `suTextEditor`, `suNumberEditor`, `suCheckboxEditor`, `suDateEditor`, `suSelectEditor`, or your own `{ input, toInput, parse, validate? }` |
| `validate(value, row)` | A message when an edited value isn't valid for the row, or `null` |
| `align` | `'start'`, `'center'` or `'end'` |
| `searchable` | `false` to leave the column out of `search` (default `true`) |
| `hidden` | `true` to start out of view; `state.allColumns` lists every column with `visible` and `pinned`, for a column menu |
| `pinned` | `'start'` or `'end'`: render those cells with `position: sticky`; `state.columns` lists them first or last |
| `pinnable` | Shows a pin in the heading to pin and unpin the column; by default only on columns that start `pinned` |

Actions (`{ id, label, danger?, bulk?, hidden?(row), disabled?(row) }`) are resolved for each row in `rows[].actions`,
and the bulk ones in `bulkActions`. Every text the table announces or shows is in `SU_TABLE_LABELS`; pass any of them
as `labels`, e.g. in the page's language.

## Tree Table

A table of rows with child rows: each parent opens and closes, and is either a data row with its own cells or a group row, a heading across the table. Rows can be numbered, cells merged, and the table's sorting, search, paging and pinned rows and columns all work on the tree. Your app renders the rows (Angular: [`@su-labs/tree-table`](https://www.npmjs.com/package/@su-labs/tree-table)).

```ts
import { SuTreeTableController } from '@su-labs/core/tree-table';

const tree = new SuTreeTableController({
  columns: [
    { key: 'name', header: 'Item', sortable: true },
    { key: 'unit', header: 'Unit', span: (unit, item) => (item.sameUnitBelow ? { rows: 2 } : null) },
    { key: 'price', header: 'Price', sortable: true },
  ],
  rowId: (item) => item.id,
  children: (item) => item.children,
  rowKind: (item) => (item.isGroup ? 'group' : 'data'),
  numbering: 'nested',
  unnumbered: (item) => item.isGroup,
  rows: await api.items(),
});

tree.state.subscribe((state) => render(state)); // render a <table role="treegrid"> with your own markup
tree.toggle('fruit');
row.addEventListener('keydown', (event) => {
  const result = tree.rowKey(row.dataset.id, event.key);
  if (result.handled) {
    event.preventDefault();
    focusRow(result.focusId);
  }
});
```

How the tree works with the table's features:

- **Sorting** sorts each parent's children, and the top-level rows, never mixing levels
- **Search** keeps the matches, the parents on the way to them (opened to show them) and the matches' own children; group rows match on their text. Numbers don't change
- **Paging** counts top-level rows, so a parent and its children always share a page
- **Pinned rows** are top-level rows, pinned with their children
- **Numbering** counts the whole tree in display order, open or not: `nested` (1, 1.1, 1.2), `restart` (1, 2 under each parent) or `continue` (the parent's count goes on through its children), for every parent or per parent; `unnumbered` rows (e.g. group rows) get no number and don't count
- **Merged cells**: a column's `span(value, row)` returns `{ rows, columns }`. A row span stops at a group row, at the end of its parent's rows and at the end of the page; a column span stays within the column's pinned side; the first column, which holds the toggles, isn't merged down. Covered cells are left out of `cells`, and each cell has its `rowSpan`, `colSpan` and `columnIndex`

### API

| Member | Description |
|--------|-------------|
| `setRows(rows)` | Replaces the top-level rows, each with its children |
| `toggle(id, expanded?)` | Opens or closes a row with children; without `expanded`, toggles it |
| `setAllExpanded(expanded)` | Opens or closes every row |
| `isExpanded(id)` / `expandedIds()` | Whether a row is open / every open row with children |
| `rowKey(id, key)` | Handles a key on a row: up, down, Home and End move; right opens or moves to the first child; left closes or moves to the parent; Enter and Space toggle. Returns `{ handled, focusId }` |
| `rowOf(id)` | The row with this id, at any level |
| `sortBy`, `search`, `setPage`, `setPageSize`, `pinRow`, `pinColumn`, `setColumnVisible`, `setColumnPinnable`, `setColumnsVisible` | As in the table |
| `state` | Read-only store: `columns`, `rows` and `pinnedRows` (each with `kind`, `level`, `position`, `siblings`, `parentId`, `expanded`, `number`, `cells`, `label`), `allColumns`, `rowHeaderKey`, `sort`, `pagination`, `announcement`, `query`, `searching` |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `columns` | `[]` | Like table columns without `edit`, plus `span` |
| `children` | none | A row's child rows |
| `rowKind` | every row `'data'` | `'group'` for heading rows across the table |
| `groupLabel` | the first column's text | A group row's text |
| `expanded` | `false` | The ids of the rows open to start with, or `true` for every one |
| `numbering` | `'nested'` | `'nested'`, `'restart'` or `'continue'`, or a function of the parent row |
| `unnumbered` | none | Rows without a number |
| `rowId`, `labels`, `pageSize`, `pageSizes`, `pinnedRows` | | As in the table; `pageSize` counts top-level rows |

`SU_TREE_TABLE_LABELS` holds the table's English texts plus the tree's own (`Expand Fruit`, `Collapse Fruit`, `No.`).

## Skeleton

Placeholders drawn with your own HTML and CSS, so they keep the real layout, with one shimmer sweeping across every shape. Every element inside `.su-skeleton` becomes a grey shape, except wrappers with the `su-skeleton-layout` class, which only lay shapes out. `.su-skeleton` itself takes no room (`display: contents`).

```ts
import '@su-labs/core/skeleton.css';
import { setSuSkeletonBusy } from '@su-labs/core/skeleton';

const region = document.querySelector('.profile');
setSuSkeletonBusy(region, true);
const user = await loadUser();
region.replaceChildren(renderProfile(user));
setSuSkeletonBusy(region, false);
```

```html
<section class="profile">
  <div class="su-skeleton" aria-hidden="true">
    <div class="avatar"></div>
    <div class="lines su-skeleton-layout">
      <div></div>
      <div></div>
    </div>
  </div>
</section>
```

Without a bundler that handles CSS imports, link the file instead: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@su-labs/core@1.10.0/skeleton/skeleton.css">`.

### API

| Member | Description |
|--------|-------------|
| `setSuSkeletonBusy(region, busy)` | Sets `aria-busy` on the region and `aria-live="polite"`, so screen readers wait while it loads and read the content once it's ready |

### CSS Variables

| Variable | Default | |
|---|---|---|
| `--su-skeleton-color` | `#e8e8e8` | The shapes |
| `--su-skeleton-shimmer` | `#ffffff` | The shine that sweeps across |
| `--su-skeleton-radius` | `0.375rem` | Corner radius of every shape; a shape's own `border-radius` wins |
| `--su-skeleton-duration` | `2s` | One sweep |
| `--su-skeleton-angle` | `100deg` | Tilt of the shine |

The shine is fixed to the window so it runs across every shape together; iOS Safari doesn't support that, so there each shape shines on its own. It stops for visitors who ask for less motion.

## Stepper

Content split into steps shown one at a time, with rules for when the user may go forward and back. It keeps the current step and the steps visited and completed, and checks each move; your app renders the steps (Angular: [`@su-labs/stepper`](https://www.npmjs.com/package/@su-labs/stepper)).

```ts
import { SuStepperController } from '@su-labs/core/stepper';

const stepper = new SuStepperController({
  steps: [{ label: 'Account', canNext: false }, { label: 'Address' }, { label: 'Confirm' }],
});

stepper.state.subscribe((state) => render(state)); // the steps, the current one and whether next() and back() would move
form.addEventListener('input', () =>
  stepper.setSteps([{ label: 'Account', canNext: form.checkValidity() }, { label: 'Address' }, { label: 'Confirm' }]),
);
nextButton.addEventListener('click', () => stepper.next());
```

A step is completed once the user leaves it forward, as long as it still allows going forward. A jump (e.g. clicking a step's header) checks every step it passes: forward, each one's `canNext`; back, each one's `canBack`.

### API

| Member | Description |
|--------|-------------|
| `next()` / `back()` | Goes to the next or previous step that isn't disabled, if the rules allow it; returns whether it moved |
| `goTo(index)` | Goes to a step, from 0, if the rules allow it |
| `canGoTo(index)` | Whether the rules allow going there now |
| `select(index)` | Shows a step without checking the rules, e.g. to restore where the user was |
| `setSteps(steps)` | Replaces the steps (and their rules); the current step stays |
| `setLinear(linear)` | Changes the `linear` option |
| `reset(start?)` | Back to a step (the first by default) with nothing visited or completed |
| `state` | Read-only store: `steps` (each with `number`, `label`, `status`, `current`, `completed`, `visited`, `disabled`, `reachable`), `current`, `count`, `isFirst`, `isLast`, `canNext`, `canBack` |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `steps` | `[]` | Each `{ label?, canNext?, canBack?, disabled? }`; without a label only the number shows |
| `start` | `0` | The step shown first |
| `linear` | `false` | Going forward by more than one step only reaches steps already visited |

`SU_STEPPER_LABELS` holds the English texts a stepper reads out (`Step 1 of 3`, `Completed`, …), to replace in the page's language.

## Tooltip

Whether a tooltip is open, with the delays that keep it from flashing while the pointer only passes over its trigger and from closing while the pointer moves onto it, plus the maths to place it. Your app renders it (Angular: [`@su-labs/tooltip`](https://www.npmjs.com/package/@su-labs/tooltip)).

```ts
import { SuTooltipController, suTooltipPosition } from '@su-labs/core/tooltip';

const tooltip = new SuTooltipController({ showDelay: 300, hideDelay: 100 });

trigger.addEventListener('pointerenter', () => tooltip.show()); // opens after showDelay
trigger.addEventListener('pointerleave', () => tooltip.hide()); // closes after hideDelay, unless show() comes first
tooltip.state.subscribe(({ open }) => {
  panel.hidden = !open;
  if (!open) return;
  const { x, y, side, arrow, origin } = suTooltipPosition(trigger.getBoundingClientRect(), panel.getBoundingClientRect(), {
    placement: 'bottom-start',
    viewport: { width: innerWidth, height: innerHeight },
  });
  // side: where it fits after flipping; arrow: px along the edge facing the trigger; origin: where to grow from
});
```

| Method | |
|---|---|
| `show()` / `hide()` | Opens or closes after the delay; each calls off the other's pending wait |
| `open()` / `close()` / `toggle()` / `setOpen(open)` | Opens or closes now |
| `setDelays({ showDelay, hideDelay })` | New delays from the next wait |
| `cancel()` | Calls off a pending `show` or `hide` |

`suTooltipPosition(trigger, tooltip, options)` places a tooltip beside its trigger. `placement` is `top`, `right`, `bottom` or `left`, each with `-start` and `-end` (following `rtl`); with a `viewport` it moves to the other side when only that one has room and stays `padding` away from the edges. `offset` is the gap to the trigger, `arrowPadding` keeps the arrow away from the corners.

`suTooltipIconPosition(icon, tooltip, options)` places a tooltip with one corner on an icon, so it can grow out of it; `suTooltipIconClip(position, tooltip, iconSize, radius)` gives the `clip-path` to animate from (a circle on the icon) and to (the whole tooltip).

`SU_TOOLTIP_LABELS` holds the English names of the "?" icon and the close button.

## Scroll Spy

Tracks which page section is in the middle of the viewport, for example to highlight the matching navigation link. It uses `IntersectionObserver`, so there are no scroll event listeners.

```ts
import { SuScrollSpyController } from '@su-labs/core/scroll-spy';

const scrollSpy = new SuScrollSpyController();

document.querySelectorAll('section[id]').forEach((section) => scrollSpy.observe(section, section.id));
scrollSpy.activeSection.subscribe((id) => console.log('Active section:', id));
```

A section becomes active when it crosses the vertical center of the viewport.

### API

| Member | Description |
|--------|-------------|
| `observe(element, sectionId)` | Starts tracking a section; returns a function that stops tracking it |
| `setActiveSection(sectionId)` | Sets the active section manually, e.g. when a link is clicked |
| `activeSection` | Read-only store of the active section ID (`''` until one becomes active) |
| `destroy()` | Stops tracking all sections |

`observeSuScrollSpySection(element, onActive)` is the lower-level helper behind `observe()`: it calls `onActive` each time the element reaches the viewport center and returns a stop function. Use it to keep the active section in your own state.

## Visit Tracker

Counts how many times a visitor has opened the site, remembers when they last came, and flags milestone visits such as the 10th. Data is stored in `localStorage`.

```ts
import { SuVisitTrackerController } from '@su-labs/core/visit-tracker';

const visits = new SuVisitTrackerController();
visits.init(); // call once per page load

const { count, lastVisit, milestone } = visits.visit.get();
```

### API

| Member | Description |
|--------|-------------|
| `init(config?)` | Records the current visit and checks for a milestone. Call once per page load. |
| `visit` | Read-only store of `{ count, lastVisit, milestone }` |

`count` includes the current visit (`0` before `init()`), `lastVisit` is the start of the previous visit as an ISO string (`null` on the first visit), and `milestone` is the milestone reached on this visit (`null` otherwise). Invalid saved data is ignored and counting starts over.

### Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `storageKey` | `'su:visits'` | localStorage key for the visit data |
| `milestoneVisits` | `[10, 100]` | Visit numbers to flag as milestones |

## Storage

Theme and font size save the user's choice in `localStorage` by default. Pass `storage` to save it somewhere else: anything with `getItem`, `setItem` and `removeItem` (the `SuStorage` interface) works.

`createSuCookieStorage()` saves in cookies instead, so sites on the same parent domain share the setting. A theme picked on `example.com` then also applies on `app.example.com`:

```ts
import { createSuCookieStorage } from '@su-labs/core';
import { SuThemeController } from '@su-labs/core/theme';
import { SuFontSizeController } from '@su-labs/core/font-size';

const shared = createSuCookieStorage({ domain: 'example.com' });

new SuThemeController().init({ storage: shared, storageKey: 'example:theme' });

const fontSize = new SuFontSizeController();
fontSize.configure({ storage: shared, storageKey: 'example:font-size' });
fontSize.init();
```

| Option | Default | Description |
|--------|---------|-------------|
| `domain` | — | Parent domain to share with. Only used when the page is on that domain, so `localhost` keeps working with cookies of its own |
| `maxAgeDays` | `365` | Days before a saved value expires |

Cookies are sent with every request to the domain, so keep them to small settings. Use the same `storageKey` on every site that should share a value. Outside a browser the cookie storage reads and writes nothing.

## License

MIT © 2025 [Yevheniy Alekseyev](https://github.com/Greezaaa)
