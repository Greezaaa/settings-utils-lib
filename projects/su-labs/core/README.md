# @su-labs/core

![npm](https://img.shields.io/npm/v/@su-labs/core?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Framework-agnostic browser utilities with a tiny reactive store. Use them from vanilla JavaScript, React, Svelte, Angular or any other framework. No dependencies besides `tslib`.

> Using Angular? [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) wraps these utilities in Angular services with signals.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Entry Points](#entry-points)
- [Reactive Stores](#reactive-stores)
- [Theme](#theme)
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

## License

MIT © 2025 [Yevheniy Alekseyev](https://github.com/Greezaaa)
