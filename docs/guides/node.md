# Node.js and Server-Side Rendering Guide

`@su-labs/core` is safe to import and run in Node.js, so it works in server-rendered apps (Next.js, Remix, SvelteKit, Astro, …), tests and scripts.

[All guides](../README.md) · [Core API reference](../../projects/su-labs/core/README.md)

## Installation

```bash
npm install @su-labs/core
```

The package is ES modules only. Use `import`, or a dynamic `import()` inside an async function from CommonJS:

```js
// ESM
import { SuThemeController } from '@su-labs/core/theme';
```

```js
// CommonJS
async function main() {
  const { SuThemeController } = await import('@su-labs/core/theme');
}
```

## What runs on the server

The utilities manage things that only exist in a browser: the page, `localStorage` and the operating system's color scheme. In Node they keep working, but skip that browser-only work:

| Utility | In Node |
|---------|---------|
| Store (`createSuStore`) | Works fully |
| Theme | Keeps state and notifies subscribers. Does not touch the DOM or `localStorage`. `'system'` resolves to `'light'`. |
| Notifications | Works fully (it holds state only and never touches the DOM). Requires Node 19+ for `crypto.randomUUID`. |

```js
import { SuThemeController } from '@su-labs/core/theme';

const theme = new SuThemeController();
theme.theme.subscribe((name) => console.log(name)); // 'light'
theme.init({ defaultTheme: 'dark' }); // 'dark'
```

Use `isBrowser()` from `@su-labs/core` if your own code needs the same check:

```js
import { isBrowser } from '@su-labs/core';

if (isBrowser()) {
  // DOM-only code
}
```

## Server-side rendering

The server doesn't know the visitor's saved theme or system setting, so the first render uses the default. Once the page loads, `init()` in the browser applies the real theme. To keep that switch smooth:

- Style with the CSS variables (`var(--su-theme-background)`), which update without re-rendering.
- Call `init()` only in the browser, as early as possible (for example in the root layout or entry file).

Framework-specific notes are in the [React](react.md) and [Svelte](svelte.md) guides.

## Testing

In unit tests that run in Node, the utilities work without mocking. To test DOM behavior, use a DOM environment such as `jsdom` or `happy-dom`.
