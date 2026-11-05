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

## Next steps

- [Theme configuration and full API](../../projects/su-labs/core/README.md#theme)
- [Notification options and full API](../../projects/su-labs/core/README.md#notifications)
- [Scroll spy API](../../projects/su-labs/core/README.md#scroll-spy)
- [Node and server-side rendering](node.md)
