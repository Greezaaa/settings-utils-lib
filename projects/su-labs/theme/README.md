# SuThemeService

`@su-labs/theme`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/theme?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/theme?style=for-the-badge)

A robust and reactive Angular service for managing application themes. It provides a full-featured solution that supports dynamic switching, user preference persistence, and automatic system theme detection.

> **Not using Angular?** The same theme logic is available for React, Svelte, vanilla JavaScript and Node in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core). See the [installation guides](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/README.md).

## Table of Contents

- [Why Use This Library?](#why-use-this-library)
- [Features](#features)
- [Available Themes](#available-themes)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Browser Compatibility](#browser-compatibility)
- [Related Libraries](#related-libraries)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

## Why Use This Library?

- **Lightweight** - Minimal bundle size
- **Reactive** - Built with Angular Signals
- **CSS Variables** - Modern CSS custom properties
- **System Theme** - Auto-detects OS preference
- **Persistent** - Remembers user choice
- **Type-Safe** - Full TypeScript support
- **Zero Dependencies** - No bloat
- **Well Tested** - Comprehensive test coverage

## Features

* **Reactive State**: Uses Angular signals for efficient, reactive theme management.
* **System Theme Integration**: Automatically follows the user's system theme preference (`prefers-color-scheme`).
* **Persistence**: Remembers the user's last-selected theme using `localStorage`.
* **Configurable**: Customizable with a configuration object for storage keys, CSS variable prefixes, and default themes.
* **Programmatic Control**: Simple public API to set, get, and track the active theme.

## Available Themes

The service currently supports the following theme names by default:

* `light` - Light theme
* `dark` - Dark theme
* `contrast` - High contrast theme
* `custom` - Custom theme with your own variables
* `system` - Automatically follows OS preference

You can provide custom variables for any of these themes via the `themes` property in `SuThemeConfig`.

### Ready-made palettes (optional)

Eleven palettes ship with the library, none of them shown unless you list them in `palettes`:

| Name | Scheme | Look |
|------|--------|------|
| `sunset` | dark | Midnight blue, cream and amber |
| `candy` | dark | Near black, white and pink |
| `copper` | dark | Black, teal and copper |
| `solar` | light | Porcelain, midnight navy and solar orange |
| `neon` | dark | Graphite, silver mist and hyper pink |
| `sunflower` | dark | Midnight navy, powder blue and sunflower yellow |
| `tomato` | light | Oat milk, forest green and tomato red |
| `blossom` | light | Butter cream, forest green and hot pink |
| `ember` | dark | Midnight black, electric blue and sunset orange |
| `storm` | dark | Storm grey, near black and safety orange |
| `racing` | light | Polar white, glacier blue and racing red |

```typescript
theme.init({ palettes: ['solar', 'neon', 'racing'] });
theme.setTheme('neon');
theme.availableThemes(); // ['light', 'dark', 'contrast', 'custom', 'system', 'solar', 'neon', 'racing']
```

Each palette sets `--su-theme-color`, `--su-theme-background`, `--su-theme-main-accent`, `--su-theme-second-accent`
and `--su-theme-button-text` (text on the accent). Text is at least 7:1 on the background and button text at least
4.5:1 on the accent. Besides `data-theme`, the element gets `data-theme-scheme="light"` or `"dark"`, so your own
colours can follow: `[data-theme-scheme='dark'] { --shadow: none; }`.

A saved palette your site doesn't list falls back to `defaultTheme` without overwriting the saved choice, so sites
that share one saved theme (see `storage`) can offer different sets.

## Installation

You can install this library via npm:

```sh
npm install @su-labs/theme
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^22 @angular/core@^22
```

## Quick Start

```typescript
// 1. Install
npm install @su-labs/theme

// 2. Initialize in app.config.ts
import { provideAppInitializer, inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuThemeService).init();
    }),
  ],
};

// 3. Use in component
import { Component, inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

@Component({
  template: `
    <button (click)="themeService.setTheme('dark')">Dark Mode</button>
    <p>Current: {{ themeService.theme() }}</p>
  `
})
export class AppComponent {
  themeService = inject(SuThemeService);
}
```

## Usage

The `SuThemeService` must be initialized at application startup to load its configuration and initial theme.

### Example 1: Global Initialization with provideAppInitializer

```typescript
// main.ts or app.config.ts
import { provideAppInitializer, inject } from '@angular/core';
import { SuThemeService, SuThemeConfig } from '@su-labs/theme';

const myThemeConfig: SuThemeConfig = {
  // Optional: Set a default theme if none is saved
  defaultTheme: 'dark',
  // Optional: Provide custom CSS variables for any theme
  themes: {
    dark: {
      color: '#333',
      background: '#eee',
      'main-accent': '#007bff',
    },
  },
};

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      const themeService = inject(SuThemeService);
      themeService.init(myThemeConfig);
    }),
  ],
};
```

This ensures the theme is loaded and applied before the application renders. The `SuThemeService` handles all the logic internally, including loading from `localStorage` and applying the initial theme.

### Example 2: Using the Theme in Your Styles

Your service automatically applies CSS variables to the `:root` element. Your application stylesheets can use these variables, and the service will handle updating their values when the theme changes.

```CSS
/* styles.css */
/* Use the CSS variables in your stylesheet */
body {
  color: var(--su-theme-color);
  background-color: var(--su-theme-background);
}

h1 {
  color: var(--su-theme-main-accent);
}
```

The service dynamically updates these variables based on the active theme, applying a combination of its internal defaults and any custom overrides you provide in the configuration.

### Example 3: Dynamic Theme Switching

Use the setTheme() method to switch themes and the theme signal to read the current state.

```TypeScript
import { Component, inject } from '@angular/core';
import { SuThemeService, SuThemeName } from '@su-labs/theme';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [],
  template: `
    <h1>Dynamic Theme Switching</h1>
    <p>Current Theme: {{ themeService.theme() }}</p>
    <button (click)="setTheme('light')">Light</button>
    <button (click)="setTheme('dark')">Dark</button>
    <button (click)="setTheme('system')">System</button>
  `,
})
export class ThemeSwitcherComponent {
  public readonly themeService = inject(SuThemeService);

  setTheme(themeName: SuThemeName) {
    this.themeService.setTheme(themeName);
  }
}
```

This correctly shows how to use your service's public API to switch between themes. The service handles the underlying logic, including persistence and CSS variable application.

## API Reference

### Signals

| Signal | Type | Description |
|--------|------|-------------|
| `theme()` | `SuThemeName` | Current active theme name |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init(config?)` | `SuThemeConfig` | Initialize with custom configuration |
| `setTheme(theme, persist?)` | `SuThemeName, boolean` | Change theme (persist defaults to true) |
| `getTheme()` | - | Returns current theme name |
| `availableThemes()` | - | The base themes, then the palettes listed in `palettes` |
| `isAvailable(theme)` | `string` | Whether a theme can be set here |

### Types

```typescript
type SuBaseThemeName = 'light' | 'dark' | 'contrast' | 'custom' | 'system';
type SuThemeName = SuBaseThemeName | SuPaletteName; // SuPaletteName: 'sunset' | 'candy' | … | 'racing'

interface SuThemeConfig {
  storageKey?: string;      // Default: 'su:theme'
  storage?: SuStorage;      // Default: localStorage
  target?: HTMLElement;     // Default: <html>
  cssVarPrefix?: string;    // Default: '--su-theme-'
  defaultTheme?: SuThemeName; // Default: 'system'
  themes?: {
    [key in SuThemeName]?: Record<string, string>;
  };
  palettes?: SuPaletteName[]; // Default: none
}
```

## Configuration Options

The service can be configured to fit your application's needs.

| Option             | Description                                                   | Default Value    |
|--------------------|---------------------------------------------------------------|------------------|
| `storageKey`       | The key used to persist the selected theme.                   | `'su:theme'`     |
| `storage`          | Where the theme is saved. Use `createSuCookieStorage({ domain })` from `@su-labs/core` to share it across subdomains. | `localStorage` |
| `target`           | Element the theme is applied to. Pass a component's element to theme only that part of the page. | `<html>` |
| `cssVarPrefix`     | The prefix for all CSS variables managed by the service.      | `'--su-theme-'`  |
| `defaultTheme`     | The theme to use if no preference is saved in `localStorage`. | `'system'`       |
| `themes`           | An object with custom CSS variable overrides for each theme.  | `undefined`      |
| `palettes`         | Ready-made palettes this site offers as themes, e.g. `['solar', 'neon']`. | none |

## Browser Compatibility

Works in all modern browsers that support:
- CSS Custom Properties
- localStorage API
- matchMedia (for system theme)
- Angular 22+
- ES2022+

| Browser | Version |
|---------|---------|
| Chrome | ≥ 90 |
| Firefox | ≥ 88 |
| Safari | ≥ 14 |
| Edge | ≥ 90 |

## Related Libraries

Part of the **@su-labs** suite:

- [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker) - User visit tracking
- [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) - Toast notification system
- [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) - Scroll position tracking
- [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size) - Accessible font size controls

## Troubleshooting

### Theme not persisting?

Make sure localStorage is enabled in your browser and not blocked by privacy settings.

### CSS variables not updating?

Ensure you're using the correct prefix in your CSS (`--su-theme-` by default) and that you've initialized the service.

### System theme not working?

Check that your OS has a theme preference set and your browser supports `prefers-color-scheme` media query.

### TypeScript errors?

Ensure you have Angular 22+ and TypeScript 6.0+ installed.

## Support

- Found a bug? [Open an issue](https://github.com/Greezaaa/settings-utils-lib/issues)
- Have a feature request? [Start a discussion](https://github.com/Greezaaa/settings-utils-lib/discussions)
- Like this library? [Give it a star!](https://github.com/Greezaaa/settings-utils-lib)

## Notes

- The service safely handles properties and ignores null or undefined values, preventing issues like prototype pollution.
- Works seamlessly with standalone components and reactive setups thanks to its signal-based API.
- Persistence is handled automatically: The service saves the user's preference to `localStorage` when you call `setTheme(..., true)`. On initialization, it automatically restores this saved preference. You do not need to add this logic in your components.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/theme/LICENSE) file for details.