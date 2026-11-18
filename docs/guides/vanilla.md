# Vanilla JavaScript Guide

Use `@su-labs/core` in plain JavaScript or TypeScript, with a bundler (Vite, webpack, esbuild, …) or straight from a CDN with no build step.

[All guides](../README.md) · [Core API reference](../../projects/su-labs/core/README.md)

## Installation

### With a bundler

```bash
npm install @su-labs/core
```

```js
import { SuThemeController } from '@su-labs/core/theme';
```

### Without a build step (CDN)

Load the package as an ES module directly in the browser:

```html
<script type="module">
  import { SuThemeController } from 'https://esm.sh/@su-labs/core@1.12.0/theme';
</script>
```

Pin the version in the URL so updates don't change your page unexpectedly.

## How state works

Every utility exposes its state as a store with `get()` and `subscribe(listener)`. `subscribe` calls the listener immediately with the current value and again on every change, and returns a function that stops listening.

```js
const unsubscribe = store.subscribe((value) => console.log(value));
unsubscribe();
```

## Theme

### Setup

Create one controller for the whole page and call `init()` once, as early as possible:

```js
import { SuThemeController } from '@su-labs/core/theme';

export const theme = new SuThemeController();
theme.init({ defaultTheme: 'system' });
```

`init()` applies the saved theme (or the default), sets `data-theme` and the CSS variables on `<html>`, and starts following the operating system when the theme is `'system'`.

### Switching themes

```html
<button type="button" data-theme-option="light">Light</button>
<button type="button" data-theme-option="dark">Dark</button>
<button type="button" data-theme-option="system">System</button>
<p>Current theme: <span id="current-theme"></span></p>

<script type="module">
  import { SuThemeController } from 'https://esm.sh/@su-labs/core@1.12.0/theme';

  const theme = new SuThemeController();
  theme.init();

  document.querySelectorAll('[data-theme-option]').forEach((button) => {
    button.addEventListener('click', () => theme.setTheme(button.dataset.themeOption));
  });

  theme.theme.subscribe((name) => {
    document.querySelector('#current-theme').textContent = name;
  });
</script>
```

### Styling

```css
body {
  color: var(--su-theme-color);
  background: var(--su-theme-background);
}

a {
  color: var(--su-theme-main-accent);
}

/* Or target a theme directly */
[data-theme='dark'] img {
  filter: brightness(0.9);
}
```

### Cleanup

Single-page apps that remove the controller should call `theme.destroy()` to stop listening to system theme changes.

## Font Size

Text size controls that stay within limits and remember the user's choice:

```html
<button type="button" id="smaller">A-</button>
<button type="button" id="reset">A</button>
<button type="button" id="bigger">A+</button>

<script type="module">
  import { SuFontSizeController } from 'https://esm.sh/@su-labs/core@1.12.0/font-size';

  const fontSize = new SuFontSizeController();
  fontSize.init();

  const smaller = document.querySelector('#smaller');
  const bigger = document.querySelector('#bigger');
  smaller.addEventListener('click', () => fontSize.decrease());
  bigger.addEventListener('click', () => fontSize.increase());
  document.querySelector('#reset').addEventListener('click', () => fontSize.reset());

  fontSize.fontSize.subscribe((size) => {
    const { minSize, maxSize } = fontSize.limits.get();
    smaller.disabled = size === minSize;
    bigger.disabled = size === maxSize;
  });
</script>
```

Size the page from the CSS variable and use `rem` everywhere else:

```css
html {
  font-size: var(--base-font-size);
}
```

## Notifications

The controller keeps the list of notifications and closes them on time; you render the list.

```html
<div id="notifications"></div>
<button type="button" id="save">Save</button>

<script type="module">
  import { SuNotificationController } from 'https://esm.sh/@su-labs/core@1.12.0/notifications';

  const notifications = new SuNotificationController();
  const container = document.querySelector('#notifications');

  notifications.notifications.subscribe((list) => {
    container.replaceChildren(
      ...list.map((notification) => {
        const item = document.createElement('div');
        item.className = `notification ${notification.type}`;
        item.textContent = notification.message;

        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = '×';
        close.addEventListener('click', () => notifications.dismiss(notification.id));

        item.append(close);
        return item;
      }),
    );
  });

  document.querySelector('#save').addEventListener('click', () => {
    notifications.show({ type: 'success', message: 'Saved!' });
  });
</script>
```

Use `textContent` (not `innerHTML`) for messages so user-provided text can't inject HTML. Use `notifications.position` to place the container, for example as a class name.

## Scroll Spy

Highlight the navigation link of the section in the middle of the screen:

```html
<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
</nav>

<section id="home">...</section>
<section id="about">...</section>

<script type="module">
  import { SuScrollSpyController } from 'https://esm.sh/@su-labs/core@1.12.0/scroll-spy';

  const scrollSpy = new SuScrollSpyController();
  document.querySelectorAll('section[id]').forEach((section) => scrollSpy.observe(section, section.id));

  scrollSpy.activeSection.subscribe((activeId) => {
    document.querySelectorAll('nav a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  });
</script>
```

## Visit Tracker

Greet returning visitors:

```html
<p id="welcome"></p>

<script type="module">
  import { SuVisitTrackerController } from 'https://esm.sh/@su-labs/core@1.12.0/visit-tracker';

  const visits = new SuVisitTrackerController();
  visits.init();

  const { count, lastVisit, milestone } = visits.visit.get();
  const welcome = document.querySelector('#welcome');

  if (milestone) {
    welcome.textContent = `Visit number ${milestone}. Thanks for coming back!`;
  } else if (lastVisit) {
    welcome.textContent = `Welcome back! Visit ${count}, last seen ${new Date(lastVisit).toLocaleDateString()}.`;
  } else {
    welcome.textContent = 'Welcome!';
  }
</script>
```

Call `init()` once per page load; every call counts as a visit.

## Table

The controller keeps a data table's state from your API's rows: the cell texts, sorting, selection, order and
editing. You render it as a real `<table>`, with `aria-sort` on the sorted heading and the announcement in a live
region.

```html
<table>
  <caption>Users</caption>
  <thead><tr id="headings"></tr></thead>
  <tbody id="rows"></tbody>
</table>
<div role="status" class="visually-hidden" id="announcement"></div>

<script type="module">
  import { suNumberEditor, SuTableController, suTextEditor } from 'https://esm.sh/@su-labs/core@1.7.0/table';

  const table = new SuTableController({
    columns: [
      { key: 'name', header: 'Name', sortable: true, edit: suTextEditor() },
      { key: 'age', header: 'Age', sortable: true, edit: suNumberEditor({ min: 0 }) },
    ],
    rowId: (user) => user.id,
    rows: await fetch('/api/users').then((response) => response.json()),
  });

  table.state.subscribe((state) => {
    document.querySelector('#headings').replaceChildren(
      ...state.columns.map((column) => {
        const heading = document.createElement('th');
        heading.scope = 'col';
        if (column.sort !== 'none') heading.ariaSort = column.sort;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = column.header;
        button.addEventListener('click', () => table.sortBy(column.key));
        heading.append(button);
        return heading;
      }),
    );
    document.querySelector('#rows').replaceChildren(
      ...state.rows.map((row) => {
        const tr = document.createElement('tr');
        row.cells.forEach((cell, index) => {
          const td = document.createElement(index === 0 ? 'th' : 'td');
          if (index === 0) td.scope = 'row';
          td.textContent = cell.text;
          tr.append(td);
        });
        return tr;
      }),
    );
    document.querySelector('#announcement').textContent = state.announcement;
  });
</script>
```

### Editing

`startEdit` edits one row (every field) or many (only the fields that change apply to all). Bind each control of
`state.draft.fields` to `setDraft`, then `save()` returns the rows in the API's shape:

```ts
table.startEdit([user.id]); // or startEdit() for the selected rows
table.setDraft('age', '33'); // the control's value as typed: text, or a boolean for a checkbox
const result = table.save();
if (result.ok) {
  await fetch('/api/users', { method: 'PUT', body: JSON.stringify(result.rows) });
} // otherwise each field of state.draft has its error message
```

Moving a row with the keyboard is one call on its handle's keydown:
`if (table.moveKey(row.id, event.key).handled) event.preventDefault();`

### Paging, search, pinning and columns

Turn them on with options, then call the controller from your controls. `state.pagination`, `state.pinnedRows`,
`state.allColumns` (every column with `visible` and `pinned`) and `state.query` hold what to render:

```ts
const table = new SuTableController<User>({
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

table.setPage(1); // pages count from 0
table.setPageSize(25);
table.search('ana'); // every word, ignoring case and accents; '' clears it
table.pinRow(2); // above the other rows on every page
table.pinColumn('age', 'end'); // or null to unpin
table.setColumnVisible('email', true); // the field stays in the row data either way
```

Render pinned cells with `position: sticky` and pinned rows first in `<tbody>`.

## Skeleton

Draw the placeholder with your own elements inside `.su-skeleton`, laid out like the real content. Wrappers with `su-skeleton-layout` only lay shapes out and aren't drawn:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@su-labs/core@1.12.0/skeleton/skeleton.css" />

<section class="profile">
  <div class="su-skeleton" aria-hidden="true">
    <div class="avatar"></div>
    <div class="lines su-skeleton-layout">
      <div></div>
      <div></div>
    </div>
  </div>
</section>

<script type="module">
  import { setSuSkeletonBusy } from 'https://esm.sh/@su-labs/core@1.12.0/skeleton';

  const region = document.querySelector('.profile');
  setSuSkeletonBusy(region, true);
  const user = await fetch('/api/user').then((response) => response.json());
  region.replaceChildren(renderProfile(user));
  setSuSkeletonBusy(region, false);
</script>
```

With a bundler, `import '@su-labs/core/skeleton.css';` instead of the link.

## Stepper

Keep one controller per stepper and pass it the steps' rules again whenever they change, e.g. as a form is filled. Render the headers from `state` and call `next()`, `back()` or `goTo()`; each returns whether it moved:

```html
<ol id="steps" aria-label="Sign up"></ol>
<input id="name" />
<button type="button" id="back">Back</button>
<button type="button" id="next">Next</button>

<script type="module">
  import { SuStepperController } from 'https://esm.sh/@su-labs/core@1.12.0/stepper';

  const name = document.querySelector('#name');
  const steps = () => [{ label: 'Account', canNext: name.value.length > 0 }, { label: 'Plan' }, { label: 'Confirm' }];
  const stepper = new SuStepperController({ steps: steps() });

  stepper.state.subscribe((state) => {
    document.querySelector('#steps').replaceChildren(
      ...state.steps.map((step) => {
        const item = document.createElement('li');
        item.textContent = `${step.number} ${step.label ?? ''}`;
        if (step.current) item.setAttribute('aria-current', 'step');
        return item;
      }),
    );
    name.hidden = state.current !== 0;
    document.querySelector('#back').disabled = !state.canBack;
    document.querySelector('#next').disabled = !state.canNext;
  });
  name.addEventListener('input', () => stepper.setSteps(steps()));
  document.querySelector('#back').addEventListener('click', () => stepper.back());
  document.querySelector('#next').addEventListener('click', () => stepper.next());
</script>
```

## Tooltip

Keep one controller per tooltip for whether it's open, with the delays that stop it flashing, and place it with `suTooltipPosition` each time it opens. It returns the side it fits on, where the arrow points and the point to grow from:

```html
<button type="button" id="save" aria-describedby="save-tip">Save</button>
<div id="save-tip" role="tooltip" popover="manual">Saves a draft</div>

<script type="module">
  import { SuTooltipController, suTooltipPosition } from 'https://esm.sh/@su-labs/core@1.12.0/tooltip';

  const trigger = document.querySelector('#save');
  const panel = document.querySelector('#save-tip');
  const tooltip = new SuTooltipController({ showDelay: 300, hideDelay: 100 });

  tooltip.state.subscribe(({ open }) => {
    if (!open) return panel.hidePopover();
    panel.showPopover();
    const { x, y } = suTooltipPosition(trigger.getBoundingClientRect(), panel.getBoundingClientRect(), {
      placement: 'top',
      viewport: { width: innerWidth, height: innerHeight },
    });
    Object.assign(panel.style, { position: 'fixed', margin: 0, left: `${x}px`, top: `${y}px` });
  });
  trigger.addEventListener('pointerenter', () => tooltip.show());
  trigger.addEventListener('pointerleave', () => tooltip.hide());
  trigger.addEventListener('focus', () => tooltip.open());
  trigger.addEventListener('blur', () => tooltip.close());
  document.addEventListener('keydown', (event) => event.key === 'Escape' && tooltip.close());
</script>
```

## Tree table

Render the rows on screen from `state` as a `treegrid`: each row has its `level`, `position`, `siblings` and `expanded` for the ARIA attributes, and `cells` with their `rowSpan` and `colSpan`. Call `toggle(id)` from a row's button and `rowKey(id, key)` from its keydown:

```html
<table role="treegrid" aria-label="Price list"><tbody id="tree"></tbody></table>

<script type="module">
  import { SuTreeTableController } from 'https://esm.sh/@su-labs/core@1.12.0/tree-table';

  const tree = new SuTreeTableController({
    columns: [
      { key: 'name', header: 'Item' },
      { key: 'price', header: 'Price' },
    ],
    rowId: (item) => item.id,
    children: (item) => item.children,
    rowKind: (item) => (item.isGroup ? 'group' : 'data'),
    rows: items,
  });

  tree.state.subscribe((state) => {
    document.querySelector('#tree').replaceChildren(
      ...state.rows.map((row) => {
        const tr = document.createElement('tr');
        tr.tabIndex = -1;
        tr.dataset.id = row.id;
        tr.setAttribute('aria-level', row.level);
        tr.setAttribute('aria-posinset', row.position);
        tr.setAttribute('aria-setsize', row.siblings);
        if (row.expanded !== null) tr.setAttribute('aria-expanded', row.expanded);
        const cells = row.kind === 'group' ? [{ text: row.label, colSpan: state.columns.length, rowSpan: 1 }] : row.cells;
        tr.append(
          ...cells.map((cell) => {
            const td = document.createElement('td');
            Object.assign(td, { textContent: cell.text, colSpan: cell.colSpan, rowSpan: cell.rowSpan });
            return td;
          }),
        );
        tr.addEventListener('click', () => tree.toggle(row.id));
        tr.addEventListener('keydown', (event) => {
          const result = tree.rowKey(row.id, event.key);
          if (result.handled) {
            event.preventDefault();
            document.querySelector(`#tree [data-id="${result.focusId}"]`)?.focus();
          }
        });
        return tr;
      }),
    );
  });
</script>
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
- [Tree table options and full API](../../projects/su-labs/core/README.md#tree-table)
- [Node and server-side rendering](node.md)
