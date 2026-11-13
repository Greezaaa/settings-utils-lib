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

## Next steps

- [Theme configuration and full API](../../projects/su-labs/core/README.md#theme)
- [Font size configuration and full API](../../projects/su-labs/core/README.md#font-size)
- [Notification options and full API](../../projects/su-labs/core/README.md#notifications)
- [Scroll spy API](../../projects/su-labs/core/README.md#scroll-spy)
- [Visit tracker API](../../projects/su-labs/core/README.md#visit-tracker)
- [Node and server-side rendering](node.md)
