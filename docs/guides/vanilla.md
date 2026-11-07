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
  import { SuThemeController } from 'https://esm.sh/@su-labs/core@1.3.0/theme';
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
  import { SuThemeController } from 'https://esm.sh/@su-labs/core@1.3.0/theme';

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

## Font Size

Text size controls that stay within limits and remember the user's choice:

```html
<button type="button" id="smaller">A-</button>
<button type="button" id="reset">A</button>
<button type="button" id="bigger">A+</button>

<script type="module">
  import { SuFontSizeController } from 'https://esm.sh/@su-labs/core@1.3.0/font-size';

  const fontSize = new SuFontSizeController();
  fontSize.init();

  const smaller = document.querySelector('#smaller');
  const bigger = document.querySelector('#bigger');
  smaller.addEventListener('click', () => fontSize.decrease());
  bigger.addEventListener('click', () => fontSize.increase());
  document.querySelector('#reset').addEventListener('click', () => fontSize.reset());

  fontSize.fontSize.subscribe((size) => {
    const { minSize, maxSize } = fontSize.limits.get();
    smaller.disabled = size === minSize;
    bigger.disabled = size === maxSize;
  });
</script>
```

Size the page from the CSS variable and use `rem` everywhere else:

```css
html {
  font-size: var(--base-font-size);
}
```

## Notifications

The controller keeps the list of notifications and closes them on time; you render the list.

```html
<div id="notifications"></div>
<button type="button" id="save">Save</button>

<script type="module">
  import { SuNotificationController } from 'https://esm.sh/@su-labs/core@1.3.0/notifications';

  const notifications = new SuNotificationController();
  const container = document.querySelector('#notifications');

  notifications.notifications.subscribe((list) => {
    container.replaceChildren(
      ...list.map((notification) => {
        const item = document.createElement('div');
        item.className = `notification ${notification.type}`;
        item.textContent = notification.message;

        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = '×';
        close.addEventListener('click', () => notifications.dismiss(notification.id));

        item.append(close);
        return item;
      }),
    );
  });

  document.querySelector('#save').addEventListener('click', () => {
    notifications.show({ type: 'success', message: 'Saved!' });
  });
</script>
```

Use `textContent` (not `innerHTML`) for messages so user-provided text can't inject HTML. Use `notifications.position` to place the container, for example as a class name.

## Scroll Spy

Highlight the navigation link of the section in the middle of the screen:

```html
<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
</nav>

<section id="home">...</section>
<section id="about">...</section>

<script type="module">
  import { SuScrollSpyController } from 'https://esm.sh/@su-labs/core@1.3.0/scroll-spy';

  const scrollSpy = new SuScrollSpyController();
  document.querySelectorAll('section[id]').forEach((section) => scrollSpy.observe(section, section.id));

  scrollSpy.activeSection.subscribe((activeId) => {
    document.querySelectorAll('nav a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
    });
  });
</script>
```

## Visit Tracker

Greet returning visitors:

```html
<p id="welcome"></p>

<script type="module">
  import { SuVisitTrackerController } from 'https://esm.sh/@su-labs/core@1.3.0/visit-tracker';

  const visits = new SuVisitTrackerController();
  visits.init();

  const { count, lastVisit, milestone } = visits.visit.get();
  const welcome = document.querySelector('#welcome');

  if (milestone) {
    welcome.textContent = `Visit number ${milestone}. Thanks for coming back!`;
  } else if (lastVisit) {
    welcome.textContent = `Welcome back! Visit ${count}, last seen ${new Date(lastVisit).toLocaleDateString()}.`;
  } else {
    welcome.textContent = 'Welcome!';
  }
</script>
```

Call `init()` once per page load; every call counts as a visit.

## Next steps

- [Theme configuration and full API](../../projects/su-labs/core/README.md#theme)
- [Font size configuration and full API](../../projects/su-labs/core/README.md#font-size)
- [Notification options and full API](../../projects/su-labs/core/README.md#notifications)
- [Scroll spy API](../../projects/su-labs/core/README.md#scroll-spy)
- [Visit tracker API](../../projects/su-labs/core/README.md#visit-tracker)
- [Node and server-side rendering](node.md)
