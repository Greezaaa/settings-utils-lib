# React Guide

Use `@su-labs/core` in React with the built-in `useSyncExternalStore` hook. No React-specific package or extra dependency is needed.

[All guides](../README.md) · [Core API reference](../../projects/su-labs/core/README.md)

## Installation

```bash
npm install @su-labs/core
```

Requires React 18 or later (for `useSyncExternalStore`).

## How state works

Every utility exposes its state as a store with `get()` and `subscribe(listener)`. That is exactly what `useSyncExternalStore` expects, so reading a store in a component is one line:

```tsx
const value = useSyncExternalStore(store.subscribe, store.get, store.get);
```

The third argument is used during server rendering (Next.js, Remix). Passing it is harmless in client-only apps.

## Theme

### Setup

Create one controller for the whole app in its own module and call `init()` once:

```ts
// src/theme.ts
import { SuThemeController } from '@su-labs/core/theme';

export const themeController = new SuThemeController();
themeController.init({ defaultTheme: 'system' });
```

### A reusable hook

```ts
// src/use-theme.ts
import { useSyncExternalStore } from 'react';
import { themeController } from './theme';

export function useTheme() {
  const { theme } = themeController;
  return useSyncExternalStore(theme.subscribe, theme.get, theme.get);
}
```

### Switching themes

```tsx
import type { SuThemeName } from '@su-labs/core/theme';
import { themeController } from './theme';
import { useTheme } from './use-theme';

const OPTIONS: SuThemeName[] = ['light', 'dark', 'system'];

export function ThemeSwitcher() {
  const theme = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      {OPTIONS.map((option) => (
        <button key={option} type="button" onClick={() => themeController.setTheme(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}
```

`useTheme()` returns the resolved theme (`'light'`, `'dark'`, …). To show which option the user picked, including `'system'`, use `themeController.getUserPreference()`.

### Styling

The controller sets CSS variables and a `data-theme` attribute on `<html>`, so plain CSS, CSS Modules, Tailwind and CSS-in-JS all work:

```css
body {
  color: var(--su-theme-color);
  background: var(--su-theme-background);
}
```

### Next.js and other server rendering

- Put components that call `useTheme()` in a file marked `'use client'`.
- On the server there is no saved preference or system setting, so the theme renders as `'light'` and switches after hydration. Avoid rendering text that depends on the theme during the first render, or style with the CSS variables, which update without re-rendering.

## Font Size

### Setup

```ts
// src/font-size.ts
import { SuFontSizeController } from '@su-labs/core/font-size';

export const fontSizeController = new SuFontSizeController();
fontSizeController.init();
```

### Controls

```tsx
import { useSyncExternalStore } from 'react';
import { fontSizeController } from './font-size';

export function FontSizeControls() {
  const { fontSize, limits } = fontSizeController;
  const size = useSyncExternalStore(fontSize.subscribe, fontSize.get, fontSize.get);
  const { minSize, maxSize } = useSyncExternalStore(limits.subscribe, limits.get, limits.get);

  return (
    <div>
      <button type="button" disabled={size === minSize} onClick={() => fontSizeController.decrease()}>
        A-
      </button>
      <button type="button" onClick={() => fontSizeController.reset()}>
        A
      </button>
      <button type="button" disabled={size === maxSize} onClick={() => fontSizeController.increase()}>
        A+
      </button>
    </div>
  );
}
```

Size the page with `html { font-size: var(--base-font-size); }` and use `rem` units elsewhere.

## Notifications

The controller keeps the list of notifications and closes them on time; you render the list with your own components.

### Setup

```ts
// src/notifications.ts
import { SuNotificationController } from '@su-labs/core/notifications';

export const notificationController = new SuNotificationController();
notificationController.configure({ position: 'top-right' });
```

### Rendering the list

```tsx
import { useSyncExternalStore } from 'react';
import { notificationController } from './notifications';

export function Notifications() {
  const { notifications, position } = notificationController;
  const list = useSyncExternalStore(notifications.subscribe, notifications.get, notifications.get);
  const currentPosition = useSyncExternalStore(position.subscribe, position.get, position.get);

  return (
    <div className={`notifications ${currentPosition}`}>
      {list.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          {notification.message}
          <button type="button" onClick={() => notificationController.dismiss(notification.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
```

Render `<Notifications />` once, near the root of the app.

### Showing a notification

Call `show()` from anywhere, including outside components:

```ts
import { notificationController } from './notifications';

notificationController.show({ type: 'success', message: 'Saved!' });
```

## Scroll Spy

### Setup

```ts
// src/scroll-spy.ts
import { SuScrollSpyController } from '@su-labs/core/scroll-spy';

export const scrollSpy = new SuScrollSpyController();
```

### Tracking sections

Register each section with a ref callback. React 19 runs the returned function when the element is removed, which stops tracking it:

```tsx
import { scrollSpy } from './scroll-spy';

export function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} ref={(element) => (element ? scrollSpy.observe(element, id) : undefined)}>
      {children}
    </section>
  );
}
```

On React 18, register the section in a `useEffect` with a `useRef` instead, and return the stop function from the effect.

### Highlighting the active link

```tsx
import { useSyncExternalStore } from 'react';
import { scrollSpy } from './scroll-spy';

export function Nav({ sections }: { sections: { id: string; name: string }[] }) {
  const { activeSection } = scrollSpy;
  const activeId = useSyncExternalStore(activeSection.subscribe, activeSection.get, activeSection.get);

  return (
    <nav>
      {sections.map((section) => (
        <a key={section.id} href={`#${section.id}`} className={section.id === activeId ? 'active' : undefined}>
          {section.name}
        </a>
      ))}
    </nav>
  );
}
```

## Visit Tracker

### Setup

Record the visit once, when the app starts:

```ts
// src/visits.ts
import { SuVisitTrackerController } from '@su-labs/core/visit-tracker';

export const visitTracker = new SuVisitTrackerController();
visitTracker.init();
```

### Reading the visit

```tsx
import { useSyncExternalStore } from 'react';
import { visitTracker } from './visits';

export function Welcome() {
  const { visit } = visitTracker;
  const { count, milestone } = useSyncExternalStore(visit.subscribe, visit.get, visit.get);

  if (milestone) {
    return <p>Visit number {milestone}. Thanks for coming back!</p>;
  }
  return <p>{count > 1 ? `Welcome back! Visit ${count}.` : 'Welcome!'}</p>;
}
```

Keep `init()` at module level, not in a component or effect. React Strict Mode runs effects twice in development, which would count two visits.

## Table

The controller keeps a data table's state from your API's rows: the cell texts, sorting, selection, order and
editing. You render it as a real `<table>`, with `aria-sort` on the sorted heading and the announcement in a live
region.

### Setup

```ts
// src/table.ts
import { suNumberEditor, SuTableColumns, SuTableController, suTextEditor } from '@su-labs/core/table';

export interface User {
  readonly id: number;
  readonly name: string;
  readonly age: number;
}

const columns: SuTableColumns<User> = [
  { key: 'name', header: 'Name', sortable: true, edit: suTextEditor({ requiredMessage: 'Enter a name' }) },
  { key: 'age', header: 'Age', sortable: true, edit: suNumberEditor({ min: 0 }) },
];

export const usersTable = new SuTableController<User>({ columns, rowId: (user) => user.id });
```

### Rendering the table

```tsx
import { useEffect, useSyncExternalStore } from 'react';
import { usersTable } from './table';

export function UsersTable() {
  const state = useSyncExternalStore(usersTable.state.subscribe, usersTable.state.get, usersTable.state.get);

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((users) => usersTable.setRows(users));
  }, []);

  return (
    <>
      <table>
        <caption>Users</caption>
        <thead>
          <tr>
            <th scope="col">
              <input
                type="checkbox"
                aria-label="Select all rows"
                checked={state.selection === 'all'}
                onChange={() => usersTable.selectAll()}
              />
            </th>
            {state.columns.map((column) => (
              <th key={String(column.key)} scope="col" aria-sort={column.sort === 'none' ? undefined : column.sort}>
                <button type="button" onClick={() => usersTable.sortBy(column.key)}>
                  {column.header}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.rows.map((row) => (
            <tr key={row.id}>
              <td>
                <input
                  type="checkbox"
                  aria-label={`Select ${row.label}`}
                  checked={row.selected}
                  onChange={() => usersTable.select(row.id)}
                />
              </td>
              {row.cells.map((cell, index) =>
                index === 0 ? (
                  <th key={String(cell.key)} scope="row">{cell.text}</th>
                ) : (
                  <td key={String(cell.key)}>{cell.text}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div role="status" className="visually-hidden">{state.announcement}</div>
    </>
  );
}
```

### Editing

`startEdit` edits one row (every field) or many (only the fields that change apply to all). Bind each control of
`state.draft.fields` to `setDraft`, then `save()` returns the rows in the API's shape:

```ts
usersTable.startEdit([user.id]); // or startEdit() for the selected rows
usersTable.setDraft('age', '33'); // the control's value as typed: text, or a boolean for a checkbox
const result = usersTable.save();
if (result.ok) {
  await api.saveUsers(result.rows);
} // otherwise each field of state.draft has its error message
```

Moving a row with the keyboard is one call on its handle's keydown:
`if (usersTable.moveKey(row.id, event.key).handled) event.preventDefault();`

### Paging, search, pinning and columns

Turn them on with options, then call the controller from your controls. `state.pagination`, `state.pinnedRows`,
`state.allColumns` (every column with `visible` and `pinned`) and `state.query` hold what to render:

```ts
const usersTable = new SuTableController<User>({
  columns: [
    { key: 'name', header: 'Name', pinned: 'start' }, // stays in view while the row scrolls sideways
    { key: 'age', header: 'Age', align: 'end', pinnable: true }, // a pin in its heading
    { key: 'email', header: 'Email', hidden: true, searchable: false },
  ],
  rowId: (user) => user.id,
  pageSize: 10,
  pageSizes: [10, 25, 'all'],
  pinnedRows: [1],
});

usersTable.setPage(1); // pages count from 0
usersTable.setPageSize(25);
usersTable.search('ana'); // every word, ignoring case and accents; '' clears it
usersTable.pinRow(2); // above the other rows on every page
usersTable.pinColumn('age', 'end'); // or null to unpin
usersTable.setColumnVisible('email', true); // the field stays in the row data either way
```

Render pinned cells with `position: sticky` and pinned rows first in `<tbody>`.

## Skeleton

Import the stylesheet once, then bind `aria-busy` on the region and draw the placeholder with your own elements, laid out like the real content:

```tsx
import '@su-labs/core/skeleton.css';

export function Profile({ user }: { user?: User }) {
  return (
    <section className="profile" aria-live="polite" aria-busy={!user}>
      {user ? (
        <ProfileCard user={user} />
      ) : (
        <div className="su-skeleton" aria-hidden="true">
          <div className="avatar" />
          <div className="lines su-skeleton-layout">
            <div />
            <div />
          </div>
        </div>
      )}
    </section>
  );
}
```

## Stepper

Keep one controller per stepper and pass it the steps' rules again whenever they change, e.g. as a form is filled. Render the headers from `state` and call `next()`, `back()` or `goTo()`; each returns whether it moved:

```tsx
import { useEffect, useState, useSyncExternalStore } from 'react';
import { SuStepperController } from '@su-labs/core/stepper';

export function SignUp() {
  const [stepper] = useState(() => new SuStepperController());
  const state = useSyncExternalStore(stepper.state.subscribe, stepper.state.get, stepper.state.get);
  const [name, setName] = useState('');

  useEffect(() => {
    stepper.setSteps([{ label: 'Account', canNext: name.length > 0 }, { label: 'Plan' }, { label: 'Confirm' }]);
  }, [stepper, name]);

  return (
    <>
      <ol aria-label="Sign up">
        {state.steps.map((step) => (
          <li key={step.index} aria-current={step.current ? 'step' : undefined}>
            <span aria-hidden="true">{step.number}</span> {step.label}
          </li>
        ))}
      </ol>
      {state.current === 0 && <input value={name} onChange={(event) => setName(event.target.value)} />}
      <button type="button" disabled={!state.canBack} onClick={() => stepper.back()}>Back</button>
      <button type="button" disabled={!state.canNext} onClick={() => stepper.next()}>Next</button>
    </>
  );
}
```

## Tooltip

Keep one controller per tooltip for whether it's open, with the delays that stop it flashing, and place it with `suTooltipPosition` each time it opens. It returns the side it fits on, where the arrow points and the point to grow from:

```tsx
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { SuTooltipController, suTooltipPosition } from '@su-labs/core/tooltip';

export function SaveButton() {
  const [tooltip] = useState(() => new SuTooltipController());
  const { open } = useSyncExternalStore(tooltip.state.subscribe, tooltip.state.get, tooltip.state.get);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !trigger.current || !panel.current) return;
    const { x, y } = suTooltipPosition(trigger.current.getBoundingClientRect(), panel.current.getBoundingClientRect(), {
      viewport: { width: innerWidth, height: innerHeight },
    });
    Object.assign(panel.current.style, { left: `${x}px`, top: `${y}px` });
  }, [open]);

  return (
    <>
      <button ref={trigger} type="button" aria-describedby="save-tip" onPointerEnter={() => tooltip.show()} onPointerLeave={() => tooltip.hide()} onFocus={() => tooltip.open()} onBlur={() => tooltip.close()}>
        Save
      </button>
      <div ref={panel} id="save-tip" role="tooltip" hidden={!open} style={{ position: 'fixed' }}>
        Saves a draft
      </div>
    </>
  );
}
```

## Select

Keep one controller per select for whether it's open, the value, the search and the active option. It skips disabled options and does type-ahead; you render the list and point `aria-activedescendant` at the active option:

```tsx
import { KeyboardEvent, useState, useSyncExternalStore } from 'react';
import { SuSelectController } from '@su-labs/core/select';

export function SizeSelect() {
  const [select] = useState(
    () =>
      new SuSelectController({
        options: [
          { value: 's', label: 'Small' },
          { value: 'm', label: 'Medium' },
          { value: 'l', label: 'Large', disabled: true },
        ],
        value: 'm',
      }),
  );
  const { open, value, visible, active } = useSyncExternalStore(select.state.subscribe, select.state.get, select.state.get);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') { event.preventDefault(); open ? select.move('next') : select.open(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); select.move('previous'); }
    if (event.key === 'Enter') { event.preventDefault(); open ? select.choose() : select.open(); }
    if (event.key === 'Escape') select.close();
    if (event.key.length === 1 && event.key !== ' ') select.typeAhead(event.key);
  }

  return (
    <>
      <button type="button" role="combobox" aria-controls="size-list" aria-expanded={open} aria-activedescendant={open && active >= 0 ? `size-${active}` : undefined} onClick={() => select.toggle()} onKeyDown={onKeyDown}>
        {select.selected?.label ?? 'Choose…'}
      </button>
      <ul id="size-list" role="listbox" hidden={!open}>
        {visible.map((option, index) => (
          <li key={option.value} id={`size-${index}`} role="option" aria-selected={option.value === value} aria-disabled={option.disabled} className={index === active ? 'active' : undefined} onMouseDown={(event) => event.preventDefault()} onClick={() => select.choose(index)}>
            {option.label}
          </li>
        ))}
      </ul>
    </>
  );
}
```

## Tree table

Render the rows on screen from `state` as a `treegrid`: each row has its `level`, `position`, `siblings` and `expanded` for the ARIA attributes, and `cells` with their `rowSpan` and `colSpan`. Call `toggle(id)` from a row's button and `rowKey(id, key)` from its keydown:

```tsx
import { useState, useSyncExternalStore } from 'react';
import { SuTreeTableController } from '@su-labs/core/tree-table';

export function PriceList({ items }: { items: readonly Item[] }) {
  const [tree] = useState(
    () =>
      new SuTreeTableController<Item>({
        columns: [
          { key: 'name', header: 'Item' },
          { key: 'price', header: 'Price' },
        ],
        rowId: (item) => item.id,
        children: (item) => item.children,
        rowKind: (item) => (item.isGroup ? 'group' : 'data'),
        rows: items,
      }),
  );
  const state = useSyncExternalStore(tree.state.subscribe, tree.state.get, tree.state.get);

  return (
    <table role="treegrid" aria-label="Price list">
      <tbody>
        {state.rows.map((row) => (
          <tr
            key={row.id}
            aria-level={row.level}
            aria-posinset={row.position}
            aria-setsize={row.siblings}
            aria-expanded={row.expanded ?? undefined}
            onClick={() => tree.toggle(row.id)}
          >
            {row.kind === 'group' ? (
              <td colSpan={state.columns.length}>{row.label}</td>
            ) : (
              row.cells.map((cell) => (
                <td key={String(cell.key)} rowSpan={cell.rowSpan} colSpan={cell.colSpan}>
                  {cell.text}
                </td>
              ))
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Next steps

- [Theme configuration and full API](../../projects/su-labs/core/README.md#theme)
- [Font size configuration and full API](../../projects/su-labs/core/README.md#font-size)
- [Notification options and full API](../../projects/su-labs/core/README.md#notifications)
- [Scroll spy API](../../projects/su-labs/core/README.md#scroll-spy)
- [Visit tracker API](../../projects/su-labs/core/README.md#visit-tracker)
- [Table columns, editors and full API](../../projects/su-labs/core/README.md#table)
- [Skeleton classes and CSS variables](../../projects/su-labs/core/README.md#skeleton)
- [Stepper options and full API](../../projects/su-labs/core/README.md#stepper)
- [Tooltip options and full API](../../projects/su-labs/core/README.md#tooltip)
- [Select options and full API](../../projects/su-labs/core/README.md#select)
- [Tree table options and full API](../../projects/su-labs/core/README.md#tree-table)
- [Node and server-side rendering](node.md)
