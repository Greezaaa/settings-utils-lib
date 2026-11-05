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

## Next steps

- [Theme configuration and full API](../../projects/su-labs/core/README.md#theme)
- [Notification options and full API](../../projects/su-labs/core/README.md#notifications)
- [Scroll spy API](../../projects/su-labs/core/README.md#scroll-spy)
- [Node and server-side rendering](node.md)
