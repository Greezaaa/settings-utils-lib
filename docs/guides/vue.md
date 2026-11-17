# Vue Guide

Use `@su-labs/core` in Vue 3 and Nuxt. A small composable turns any store into a read-only `ref`, so templates update on every change.

[All guides](../README.md) · [Core API reference](../../projects/su-labs/core/README.md)

## Installation

```bash
npm install @su-labs/core
```

## How state works

Every utility exposes its state as a store with `get()` and `subscribe(listener)`. This composable connects a store to Vue's reactivity and stops listening when the component or effect scope goes away:

```ts
// src/composables/use-store.ts
import { onScopeDispose, shallowReadonly, shallowRef, type ShallowRef } from 'vue';
import type { SuReadableStore } from '@su-labs/core';

/** Read a `@su-labs/core` store as a read-only ref that follows its changes */
export function useStore<T>(store: SuReadableStore<T>): Readonly<ShallowRef<T>> {
  const value = shallowRef(store.get());
  const unsubscribe = store.subscribe((next) => (value.value = next));
  onScopeDispose(unsubscribe);
  return shallowReadonly(value);
}
```

Every example below uses it.

## Theme

### Setup

Create one controller for the whole app in its own module:

```ts
// src/lib/theme.ts
import { SuThemeController } from '@su-labs/core/theme';

export const themeController = new SuThemeController();
```

Call `init()` once when the app starts in the browser, in `main.ts` before mounting:

```ts
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { themeController } from './lib/theme';

themeController.init({ defaultTheme: 'system' });
createApp(App).mount('#app');
```

In Nuxt, do it in a client-only plugin, `plugins/su-labs.client.ts`.

### Switching themes

```vue
<script setup lang="ts">
import type { SuThemeName } from '@su-labs/core/theme';
import { useStore } from '@/composables/use-store';
import { themeController } from '@/lib/theme';

const theme = useStore(themeController.theme);
const options: SuThemeName[] = ['light', 'dark', 'system'];
</script>

<template>
  <p>Current theme: {{ theme }}</p>
  <button v-for="option in options" :key="option" type="button" @click="themeController.setTheme(option)">
    {{ option }}
  </button>
</template>
```

### Styling

The controller sets CSS variables and a `data-theme` attribute on `<html>`:

```css
body {
  color: var(--su-theme-color);
  background: var(--su-theme-background);
}
```

### Nuxt server rendering

The server has no saved preference or system setting, so pages render with the `'light'` theme and switch once the client plugin runs `init()`. Styling with the CSS variables keeps that switch smooth.

## Font Size

### Setup

```ts
// src/lib/font-size.ts
import { SuFontSizeController } from '@su-labs/core/font-size';

export const fontSizeController = new SuFontSizeController();
```

Call `fontSizeController.init()` in `main.ts`, next to the theme setup.

### Controls

```vue
<script setup lang="ts">
import { useStore } from '@/composables/use-store';
import { fontSizeController } from '@/lib/font-size';

const fontSize = useStore(fontSizeController.fontSize);
const limits = useStore(fontSizeController.limits);
</script>

<template>
  <button type="button" :disabled="fontSize === limits.minSize" @click="fontSizeController.decrease()">A-</button>
  <button type="button" @click="fontSizeController.reset()">A</button>
  <button type="button" :disabled="fontSize === limits.maxSize" @click="fontSizeController.increase()">A+</button>
</template>
```

Size the page with `html { font-size: var(--base-font-size); }` and use `rem` units elsewhere.

## Notifications

The controller keeps the list of notifications and closes them on time; you render the list with your own markup.

### Setup

```ts
// src/lib/notifications.ts
import { SuNotificationController } from '@su-labs/core/notifications';

export const notificationController = new SuNotificationController();
```

### Rendering the list

```vue
<!-- src/components/AppNotifications.vue -->
<script setup lang="ts">
import { useStore } from '@/composables/use-store';
import { notificationController } from '@/lib/notifications';

const notifications = useStore(notificationController.notifications);
const position = useStore(notificationController.position);
</script>

<template>
  <div class="notifications" :class="position">
    <div v-for="notification in notifications" :key="notification.id" class="notification" :class="notification.type">
      {{ notification.message }}
      <button type="button" @click="notificationController.dismiss(notification.id)">×</button>
    </div>
  </div>
</template>
```

Render `<AppNotifications />` once, for example in `App.vue`.

### Showing a notification

```ts
import { notificationController } from '@/lib/notifications';

notificationController.show({ type: 'success', message: 'Saved!' });
```

## Scroll Spy

### Setup

```ts
// src/lib/scroll-spy.ts
import type { Directive } from 'vue';
import { SuScrollSpyController } from '@su-labs/core/scroll-spy';

export const scrollSpy = new SuScrollSpyController();

const stops = new WeakMap<Element, () => void>();

/** Directive: `v-spy="'section-id'"` tracks the element until it is removed */
export const vSpy: Directive<Element, string> = {
  mounted: (element, { value }) => stops.set(element, scrollSpy.observe(element, value)),
  unmounted: (element) => stops.get(element)?.(),
};
```

### Tracking sections and highlighting the active link

```vue
<script setup lang="ts">
import { useStore } from '@/composables/use-store';
import { scrollSpy, vSpy } from '@/lib/scroll-spy';

const activeSection = useStore(scrollSpy.activeSection);
const sections = [
  { id: 'home', name: 'Home' },
  { id: 'about', name: 'About' },
];
</script>

<template>
  <nav>
    <a v-for="section in sections" :key="section.id" :href="`#${section.id}`" :class="{ active: activeSection === section.id }">
      {{ section.name }}
    </a>
  </nav>

  <section v-for="section in sections" :id="section.id" :key="section.id" v-spy="section.id">
    <h2>{{ section.name }}</h2>
  </section>
</template>
```

## Visit Tracker

### Setup

```ts
// src/lib/visits.ts
import { SuVisitTrackerController } from '@su-labs/core/visit-tracker';

export const visitTracker = new SuVisitTrackerController();
```

Call `visitTracker.init()` once in `main.ts`, next to the theme setup. On the server it does nothing, so the count stays `0` until the page loads.

### Reading the visit

```vue
<script setup lang="ts">
import { useStore } from '@/composables/use-store';
import { visitTracker } from '@/lib/visits';

const visit = useStore(visitTracker.visit);
</script>

<template>
  <p v-if="visit.milestone">Visit number {{ visit.milestone }}. Thanks for coming back!</p>
  <p v-else-if="visit.count > 1">Welcome back! Visit {{ visit.count }}.</p>
</template>
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

```vue
<!-- src/components/UsersTable.vue -->
<script setup lang="ts">
import { onMounted } from 'vue';
import { useStore } from '@/composables/use-store';
import { usersTable } from '@/lib/users-table';

const state = useStore(usersTable.state);

onMounted(async () => usersTable.setRows(await fetch('/api/users').then((response) => response.json())));
</script>

<template>
  <table>
    <caption>Users</caption>
    <thead>
      <tr>
        <th scope="col">
          <input
            type="checkbox"
            aria-label="Select all rows"
            :checked="state.selection === 'all'"
            @change="usersTable.selectAll()"
          />
        </th>
        <th
          v-for="column in state.columns"
          :key="String(column.key)"
          scope="col"
          :aria-sort="column.sort === 'none' ? undefined : column.sort"
        >
          <button type="button" @click="usersTable.sortBy(column.key)">{{ column.header }}</button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in state.rows" :key="row.id">
        <td>
          <input
            type="checkbox"
            :aria-label="`Select ${row.label}`"
            :checked="row.selected"
            @change="usersTable.select(row.id)"
          />
        </td>
        <component
          :is="index === 0 ? 'th' : 'td'"
          v-for="(cell, index) in row.cells"
          :key="String(cell.key)"
          :scope="index === 0 ? 'row' : undefined"
        >
          {{ cell.text }}
        </component>
      </tr>
    </tbody>
  </table>
  <div role="status" class="visually-hidden">{{ state.announcement }}</div>
</template>
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

```vue
<script setup lang="ts">
import '@su-labs/core/skeleton.css';

defineProps<{ user?: User }>();
</script>

<template>
  <section class="profile" aria-live="polite" :aria-busy="!user">
    <ProfileCard v-if="user" :user="user" />
    <div v-else class="su-skeleton" aria-hidden="true">
      <div class="avatar"></div>
      <div class="lines su-skeleton-layout">
        <div></div>
        <div></div>
      </div>
    </div>
  </section>
</template>
```

## Stepper

Keep one controller per stepper and pass it the steps' rules again whenever they change, e.g. as a form is filled. Render the headers from `state` and call `next()`, `back()` or `goTo()`; each returns whether it moved:

```vue
<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { SuStepperController } from '@su-labs/core/stepper';
import { useStore } from '@/composables/use-store';

const stepper = new SuStepperController();
const state = useStore(stepper.state);
const name = ref('');

watchEffect(() =>
  stepper.setSteps([{ label: 'Account', canNext: name.value.length > 0 }, { label: 'Plan' }, { label: 'Confirm' }]),
);
</script>

<template>
  <ol aria-label="Sign up">
    <li v-for="step in state.steps" :key="step.index" :aria-current="step.current ? 'step' : undefined">
      <span aria-hidden="true">{{ step.number }}</span> {{ step.label }}
    </li>
  </ol>
  <input v-if="state.current === 0" v-model="name" />
  <button type="button" :disabled="!state.canBack" @click="stepper.back()">Back</button>
  <button type="button" :disabled="!state.canNext" @click="stepper.next()">Next</button>
</template>
```

## Tree table

Render the rows on screen from `state` as a `treegrid`: each row has its `level`, `position`, `siblings` and `expanded` for the ARIA attributes, and `cells` with their `rowSpan` and `colSpan`. Call `toggle(id)` from a row's button and `rowKey(id, key)` from its keydown:

```vue
<script setup lang="ts">
import { SuTreeTableController } from '@su-labs/core/tree-table';
import { useStore } from '@/composables/use-store';

const props = defineProps<{ items: readonly Item[] }>();
const tree = new SuTreeTableController<Item>({
  columns: [
    { key: 'name', header: 'Item' },
    { key: 'price', header: 'Price' },
  ],
  rowId: (item) => item.id,
  children: (item) => item.children,
  rowKind: (item) => (item.isGroup ? 'group' : 'data'),
  rows: props.items,
});
const state = useStore(tree.state);
</script>

<template>
  <table role="treegrid" aria-label="Price list">
    <tbody>
      <tr
        v-for="row in state.rows"
        :key="row.id"
        :aria-level="row.level"
        :aria-posinset="row.position"
        :aria-setsize="row.siblings"
        :aria-expanded="row.expanded ?? undefined"
        @click="tree.toggle(row.id)"
      >
        <td v-if="row.kind === 'group'" :colspan="state.columns.length">{{ row.label }}</td>
        <td v-for="cell in row.cells" v-else :key="String(cell.key)" :rowspan="cell.rowSpan" :colspan="cell.colSpan">
          {{ cell.text }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
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
- [Tree table options and full API](../../projects/su-labs/core/README.md#tree-table)
- [Node and server-side rendering](node.md)
