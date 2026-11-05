# @su-labs/core

![npm](https://img.shields.io/npm/v/@su-labs/core?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Framework-agnostic browser utilities with a tiny reactive store. Use them from vanilla JavaScript, React, Svelte, Angular or any other framework. No dependencies besides `tslib`.

> Using Angular? [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) and [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) wrap these utilities in Angular services with signals.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Entry Points](#entry-points)
- [Reactive Stores](#reactive-stores)
- [Theme](#theme)
- [Notifications](#notifications)
- [Scroll Spy](#scroll-spy)
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
| Angular | [Angular guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/angular.md) (uses the Angular packages) |
| Node.js and server-side rendering | [Node guide](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/guides/node.md) |

## Entry Points

Each utility has its own entry point, so your bundle only includes what you import.

| Import | Contents |
|--------|----------|
| `@su-labs/core` | `createSuStore`, `isBrowser` |
| `@su-labs/core/theme` | `SuThemeController` and theme types |
| `@su-labs/core/notifications` | `SuNotificationController`, `isSuNotificationImageIcon` and notification types |
| `@su-labs/core/scroll-spy` | `SuScrollSpyController`, `observeSuScrollSpySection` |

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

Manages light, dark, contrast and custom themes, follows the operating system's `prefers-color-scheme` when set to `'system'`, applies a `data-theme` attribute and CSS variables to `<html>`, and saves the user's choice in `localStorage`.

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
| `storageKey` | `'su:theme'` | `localStorage` key |
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
| `configure({ position })` | Sets where notifications appear |
| `notifications` | Read-only store of the active notifications, oldest first |
| `position` | Read-only store of the position (default `'top-right'`) |
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

Positions: `'top-right'`, `'top-left'`, `'top-center'`, `'bottom-right'`, `'bottom-left'`, `'bottom-center'`.

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

## License

MIT © 2025 [Yevheniy Alekseyev](https://github.com/Greezaaa)
