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
  import { SuThemeController } from 'https://esm.sh/@su-labs/core@1.0.0/theme';
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
  import { SuThemeController } from 'https://esm.sh/@su-labs/core@1.0.0/theme';

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

## Next steps

- [Theme configuration and full API](../../projects/su-labs/core/README.md#theme)
- [Node and server-side rendering](node.md)
