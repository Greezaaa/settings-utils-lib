# Svelte Guide

Use `@su-labs/core` in Svelte and SvelteKit. Its stores follow the Svelte store contract, so the `$store` syntax works directly with no adapter.

[All guides](../README.md) · [Core API reference](../../projects/su-labs/core/README.md)

## Installation

```bash
npm install @su-labs/core
```

## How state works

Every utility exposes its state as a store with `get()` and `subscribe(listener)`. Prefix a store with `$` in a component to read it and re-render when it changes:

```svelte
<p>{$theme}</p>
```

## Theme

### Setup

Create one controller for the whole app in its own module:

```ts
// src/lib/theme.ts
import { SuThemeController } from '@su-labs/core/theme';

export const themeController = new SuThemeController();
export const theme = themeController.theme;
```

Call `init()` once when the app starts in the browser. In SvelteKit, do it in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { themeController } from '$lib/theme';

  let { children } = $props();

  onMount(() => {
    themeController.init({ defaultTheme: 'system' });
    return () => themeController.destroy();
  });
</script>

{@render children()}
```

In a plain Svelte app (no SvelteKit), call `themeController.init()` in `main.ts` before mounting.

### Switching themes

```svelte
<script lang="ts">
  import type { SuThemeName } from '@su-labs/core/theme';
  import { theme, themeController } from '$lib/theme';

  const options: SuThemeName[] = ['light', 'dark', 'system'];
</script>

<p>Current theme: {$theme}</p>

{#each options as option}
  <button type="button" onclick={() => themeController.setTheme(option)}>{option}</button>
{/each}
```

The examples use Svelte 5 syntax. In Svelte 4, write `on:click` instead of `onclick` and use `<slot />` in the layout.

### Styling

The controller sets CSS variables and a `data-theme` attribute on `<html>`:

```css
:global(body) {
  color: var(--su-theme-color);
  background: var(--su-theme-background);
}
```

### SvelteKit server rendering

The server has no saved preference or system setting, so pages render with the `'light'` theme and switch once `init()` runs in `onMount`. Styling with the CSS variables keeps that switch smooth.

## Font Size

### Setup

```ts
// src/lib/font-size.ts
import { SuFontSizeController } from '@su-labs/core/font-size';

export const fontSizeController = new SuFontSizeController();
export const fontSize = fontSizeController.fontSize;
export const limits = fontSizeController.limits;
```

Call `fontSizeController.init()` in the root layout's `onMount`, next to the theme setup.

### Controls

```svelte
<script lang="ts">
  import { fontSize, fontSizeController, limits } from '$lib/font-size';
</script>

<button type="button" disabled={$fontSize === $limits.minSize} onclick={() => fontSizeController.decrease()}>A-</button>
<button type="button" onclick={() => fontSizeController.reset()}>A</button>
<button type="button" disabled={$fontSize === $limits.maxSize} onclick={() => fontSizeController.increase()}>A+</button>
```

Size the page with `:global(html) { font-size: var(--base-font-size); }` and use `rem` units elsewhere.

## Notifications

The controller keeps the list of notifications and closes them on time; you render the list with your own markup.

### Setup

```ts
// src/lib/notifications.ts
import { SuNotificationController } from '@su-labs/core/notifications';

export const notificationController = new SuNotificationController();
export const notifications = notificationController.notifications;
export const position = notificationController.position;
```

### Rendering the list

```svelte
<!-- src/lib/Notifications.svelte -->
<script lang="ts">
  import { notificationController, notifications, position } from '$lib/notifications';
</script>

<div class="notifications {$position}">
  {#each $notifications as notification (notification.id)}
    <div class="notification {notification.type}">
      {notification.message}
      <button type="button" onclick={() => notificationController.dismiss(notification.id)}>×</button>
    </div>
  {/each}
</div>
```

Render `<Notifications />` once, for example in the root layout.

### Showing a notification

```ts
import { notificationController } from '$lib/notifications';

notificationController.show({ type: 'success', message: 'Saved!' });
```

## Scroll Spy

### Setup

```ts
// src/lib/scroll-spy.ts
import { SuScrollSpyController } from '@su-labs/core/scroll-spy';

export const scrollSpy = new SuScrollSpyController();
export const activeSection = scrollSpy.activeSection;

/** Svelte action: `use:spy={'section-id'}` tracks the element until it is removed */
export function spy(element: Element, sectionId: string) {
  const stop = scrollSpy.observe(element, sectionId);
  return { destroy: stop };
}
```

### Tracking sections and highlighting the active link

```svelte
<script lang="ts">
  import { activeSection, spy } from '$lib/scroll-spy';

  const sections = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
  ];
</script>

<nav>
  {#each sections as section (section.id)}
    <a href="#{section.id}" class:active={$activeSection === section.id}>{section.name}</a>
  {/each}
</nav>

{#each sections as section (section.id)}
  <section id={section.id} use:spy={section.id}>
    <h2>{section.name}</h2>
  </section>
{/each}
```

## Visit Tracker

### Setup

```ts
// src/lib/visits.ts
import { SuVisitTrackerController } from '@su-labs/core/visit-tracker';

export const visitTracker = new SuVisitTrackerController();
export const visit = visitTracker.visit;
```

Call `visitTracker.init()` once in the root layout's `onMount`, next to the theme setup. On the server it does nothing, so the count stays `0` until the page loads.

### Reading the visit

```svelte
<script lang="ts">
  import { visit } from '$lib/visits';
</script>

{#if $visit.milestone}
  <p>Visit number {$visit.milestone}. Thanks for coming back!</p>
{:else if $visit.count > 1}
  <p>Welcome back! Visit {$visit.count}.</p>
{/if}
```

## Table

The controller keeps a data table's state from your API's rows: the cell texts, sorting, selection, order and
editing. You render it as a real `<table>`, with `aria-sort` on the sorted heading and the announcement in a live
region.

### Setup

```ts
// src/lib/users-table.ts
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

```svelte
<!-- src/lib/UsersTable.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { usersTable } from '$lib/users-table';

  const state = usersTable.state;

  onMount(async () => usersTable.setRows(await fetch('/api/users').then((response) => response.json())));
</script>

<table>
  <caption>Users</caption>
  <thead>
    <tr>
      <th scope="col">
        <input
          type="checkbox"
          aria-label="Select all rows"
          checked={$state.selection === 'all'}
          onchange={() => usersTable.selectAll()}
        />
      </th>
      {#each $state.columns as column (column.key)}
        <th scope="col" aria-sort={column.sort === 'none' ? undefined : column.sort}>
          <button type="button" onclick={() => usersTable.sortBy(column.key)}>{column.header}</button>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each $state.rows as row (row.id)}
      <tr>
        <td>
          <input
            type="checkbox"
            aria-label={`Select ${row.label}`}
            checked={row.selected}
            onchange={() => usersTable.select(row.id)}
          />
        </td>
        {#each row.cells as cell, index (cell.key)}
          {#if index === 0}
            <th scope="row">{cell.text}</th>
          {:else}
            <td>{cell.text}</td>
          {/if}
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
<div role="status" class="visually-hidden">{$state.announcement}</div>
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

```svelte
<script lang="ts">
  import '@su-labs/core/skeleton.css';

  let { user }: { user?: User } = $props();
</script>

<section class="profile" aria-live="polite" aria-busy={!user}>
  {#if user}
    <ProfileCard {user} />
  {:else}
    <div class="su-skeleton" aria-hidden="true">
      <div class="avatar"></div>
      <div class="lines su-skeleton-layout">
        <div></div>
        <div></div>
      </div>
    </div>
  {/if}
</section>
```

## Stepper

Keep one controller per stepper and pass it the steps' rules again whenever they change, e.g. as a form is filled. Render the headers from `state` and call `next()`, `back()` or `goTo()`; each returns whether it moved:

```svelte
<script lang="ts">
  import { SuStepperController } from '@su-labs/core/stepper';

  const stepper = new SuStepperController();
  const steps = stepper.state;
  let name = $state('');

  $effect(() => {
    stepper.setSteps([{ label: 'Account', canNext: name.length > 0 }, { label: 'Plan' }, { label: 'Confirm' }]);
  });
</script>

<ol aria-label="Sign up">
  {#each $steps.steps as step (step.index)}
    <li aria-current={step.current ? 'step' : undefined}>
      <span aria-hidden="true">{step.number}</span> {step.label}
    </li>
  {/each}
</ol>
{#if $steps.current === 0}
  <input bind:value={name} />
{/if}
<button type="button" disabled={!$steps.canBack} onclick={() => stepper.back()}>Back</button>
<button type="button" disabled={!$steps.canNext} onclick={() => stepper.next()}>Next</button>
```

## Tooltip

Keep one controller per tooltip for whether it's open, with the delays that stop it flashing, and place it with `suTooltipPosition` each time it opens. It returns the side it fits on, where the arrow points and the point to grow from:

```svelte
<script lang="ts">
  import { tick } from 'svelte';
  import { SuTooltipController, suTooltipPosition } from '@su-labs/core/tooltip';

  const tooltip = new SuTooltipController();
  const tip = tooltip.state;
  let trigger: HTMLButtonElement;
  let panel: HTMLDivElement;
  let position = $state({ x: 0, y: 0 });

  $effect(() => {
    if (!$tip.open) return;
    tick().then(() => {
      position = suTooltipPosition(trigger.getBoundingClientRect(), panel.getBoundingClientRect(), {
        viewport: { width: innerWidth, height: innerHeight },
      });
    });
  });
</script>

<button bind:this={trigger} type="button" aria-describedby="save-tip" onpointerenter={() => tooltip.show()} onpointerleave={() => tooltip.hide()} onfocus={() => tooltip.open()} onblur={() => tooltip.close()}>Save</button>
<div bind:this={panel} id="save-tip" role="tooltip" hidden={!$tip.open} style="position: fixed; left: {position.x}px; top: {position.y}px">Saves a draft</div>
```

## Select

Keep one controller per select for whether it's open, the value, the search and the active option. It skips disabled options and does type-ahead; you render the list and point `aria-activedescendant` at the active option:

```svelte
<script lang="ts">
  import { SuSelectController } from '@su-labs/core/select';

  const select = new SuSelectController({
    options: [
      { value: 's', label: 'Small' },
      { value: 'm', label: 'Medium' },
      { value: 'l', label: 'Large', disabled: true },
    ],
    value: 'm',
  });
  const view = select.state;

  function onKeydown(event: KeyboardEvent) {
    const open = $view.open;
    if (event.key === 'ArrowDown') { event.preventDefault(); open ? select.move('next') : select.open(); }
    if (event.key === 'ArrowUp') { event.preventDefault(); select.move('previous'); }
    if (event.key === 'Enter') { event.preventDefault(); open ? select.choose() : select.open(); }
    if (event.key === 'Escape') select.close();
    if (event.key.length === 1 && event.key !== ' ') select.typeAhead(event.key);
  }
</script>

<button type="button" role="combobox" aria-controls="size-list" aria-expanded={$view.open} aria-activedescendant={$view.open && $view.active >= 0 ? `size-${$view.active}` : undefined} onclick={() => select.toggle()} onkeydown={onKeydown}>
  {select.selected?.label ?? 'Choose…'}
</button>
<ul id="size-list" role="listbox" hidden={!$view.open}>
  {#each $view.visible as option, index}
    <li id="size-{index}" role="option" aria-selected={option.value === $view.value} aria-disabled={option.disabled} class:active={index === $view.active} onmousedown={(event) => event.preventDefault()} onclick={() => select.choose(index)}>{option.label}</li>
  {/each}
</ul>
```

## Tree table

Render the rows on screen from `state` as a `treegrid`: each row has its `level`, `position`, `siblings` and `expanded` for the ARIA attributes, and `cells` with their `rowSpan` and `colSpan`. Call `toggle(id)` from a row's button and `rowKey(id, key)` from its keydown:

```svelte
<script lang="ts">
  import { SuTreeTableController } from '@su-labs/core/tree-table';

  let { items }: { items: readonly Item[] } = $props();
  const tree = new SuTreeTableController<Item>({
    columns: [
      { key: 'name', header: 'Item' },
      { key: 'price', header: 'Price' },
    ],
    rowId: (item) => item.id,
    children: (item) => item.children,
    rowKind: (item) => (item.isGroup ? 'group' : 'data'),
    rows: items,
  });
  const state = tree.state;
</script>

<table role="treegrid" aria-label="Price list">
  <tbody>
    {#each $state.rows as row (row.id)}
      <tr
        aria-level={row.level}
        aria-posinset={row.position}
        aria-setsize={row.siblings}
        aria-expanded={row.expanded ?? undefined}
        onclick={() => tree.toggle(row.id)}
      >
        {#if row.kind === 'group'}
          <td colspan={$state.columns.length}>{row.label}</td>
        {:else}
          {#each row.cells as cell (cell.key)}
            <td rowspan={cell.rowSpan} colspan={cell.colSpan}>{cell.text}</td>
          {/each}
        {/if}
      </tr>
    {/each}
  </tbody>
</table>
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
