# @su-labs/core

![npm](https://img.shields.io/npm/v/@su-labs/core?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Framework-agnostic browser utilities with a tiny reactive store. Use them from vanilla JavaScript, React, Svelte, Angular or any other framework. No dependencies besides `tslib`.

> Using Angular? [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme), [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size), [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications), [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) and [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker) wrap these utilities in Angular services with signals.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Entry Points](#entry-points)
- [Reactive Stores](#reactive-stores)
- [Theme](#theme)
- [Font Size](#font-size)
- [Notifications](#notifications)
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
