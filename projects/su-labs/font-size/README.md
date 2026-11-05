# Font Size

`@su-labs/font-size`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/font-size?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/font-size?style=for-the-badge)

An accessible Angular service for managing font size preferences. Provides reactive controls for text scaling, user preference persistence, and WCAG-compliant font size management.

> **Not using Angular?** The same font size controls are available for React, Svelte and vanilla JavaScript in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core). See the [installation guides](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/README.md).

## Table of Contents

- [Why Use This Library?](#why-use-this-library)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Accessibility](#accessibility)
- [Browser Compatibility](#browser-compatibility)
- [Related Libraries](#related-libraries)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

## Why Use This Library?

- **Lightweight** - Minimal bundle size
- **Reactive** - Built with Angular Signals
- **Accessible** - Helps meet WCAG 2.1 text resizing guidelines
- **Persistent** - Remembers user preference
- **CSS Variables** - Modern implementation
- **SSR Safe** - No browser APIs are touched on the server
- **Type-Safe** - Full TypeScript support
- **Well Tested** - Comprehensive test coverage

## Features

* **Reactive State**: The size, limits and `isDefault` / `isMin` / `isMax` flags are Angular signals.
* **Bounded**: The size always stays between the configured minimum and maximum.
* **Persistence**: Remembers the user's font size in `localStorage`.
* **CSS Variable**: Applies the size in pixels to a CSS custom property on `<html>`.
* **Configurable**: Customizable limits, step, storage key and CSS variable name.

## Installation

You can install this library via npm:

```sh
npm install @su-labs/font-size
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^22 @angular/core@^22
```

## Quick Start

1. Initialize the service in `app.config.ts`:

```typescript
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(FontSizeService).init();
    }),
  ],
};
```

2. Add font size controls:

```typescript
import { Component, inject } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';

@Component({
  selector: 'app-font-controls',
  template: `
    <button type="button" (click)="fontSize.decrease()" [disabled]="fontSize.isMin()">A-</button>
    <button type="button" (click)="fontSize.reset()" [disabled]="fontSize.isDefault()">A</button>
    <button type="button" (click)="fontSize.increase()" [disabled]="fontSize.isMax()">A+</button>
    <p>Current: {{ fontSize.fontSize() }}px</p>
  `,
})
export class FontControlsComponent {
  protected readonly fontSize = inject(FontSizeService);
}
```

3. Use the CSS variable in your styles:

```css
html {
  font-size: var(--base-font-size);
}
```

## Usage

### Custom Configuration

Call `configure()` before `init()`:

```typescript
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { FontSizeService } from '@su-labs/font-size';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const fontSize = inject(FontSizeService);
      fontSize.configure({
        defaultSize: 16,
        minSize: 12,
        maxSize: 24,
        step: 2,
        storageKey: 'myApp:fontSize',
        cssVarName: '--app-font-size',
      });
      fontSize.init();
    }),
  ],
};
```

### Using the Size in Your Styles

Set the variable on the root element and size everything else in `rem`, so the whole page scales:

```css
html {
  font-size: var(--base-font-size);
}

h1 {
  font-size: 2rem;
}

small {
  font-size: 0.875rem;
}
```

## API Reference

### Service (FontSizeService)

#### Signals

| Signal | Type | Description |
|--------|------|-------------|
| `fontSize()` | `number` | Current font size in pixels |
| `defaultSize()` | `number` | Default size |
| `minSize()` | `number` | Minimum size |
| `maxSize()` | `number` | Maximum size |
| `step()` | `number` | Step used by `increase()` / `decrease()` |
| `isDefault()` | `boolean` | True when the size equals the default |
| `isMin()` | `boolean` | True when the size equals the minimum |
| `isMax()` | `boolean` | True when the size equals the maximum |

Change the limits and step with `configure()`, not by writing to their signals.

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `configure(config?)` | `Partial<FontSizeConfig>` | Update limits, step, storage key or CSS variable name. Omitted values keep their current setting. |
| `init()` | - | Load the saved size (or the default) and apply it. Call once at startup. |
| `setFontSize(size)` | `number` | Set, apply and save a size (clamped to the limits) |
| `increase(step?)` | `number` | Increase by `step` (defaults to the configured step) |
| `decrease(step?)` | `number` | Decrease by `step` (defaults to the configured step) |
| `reset()` | - | Return to the default size and remove the saved value |

### Types

```typescript
type FontSizeConfig = {
  defaultSize: number;
  minSize: number;
  maxSize: number;
  step: number;
  storageKey?: string;
  cssVarName?: string;
};
```

## Configuration Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `defaultSize` | Size used before the user picks one, and after `reset()` | `14` |
| `minSize` | Smallest allowed size | `10` |
| `maxSize` | Largest allowed size | `22` |
| `step` | Pixels added or removed by `increase()` / `decrease()` | `2` |
| `storageKey` | The key used to persist the size in `localStorage` | `'su:font-size'` |
| `cssVarName` | CSS custom property set on `<html>` | `'--base-font-size'` |

Invalid combinations are corrected: a maximum below the minimum is raised to the minimum, the default is clamped to the range, and a step of zero or less becomes `1`.

## Accessibility

This library helps meet WCAG 2.1 guidelines:

- **Success Criterion 1.4.4** - Text can be resized up to 200% without loss of content or functionality
- **Success Criterion 1.4.8** - User can select foreground and background colors (when combined with theme management)
- **Success Criterion 1.4.12** - Text spacing is adjustable

### Best Practices

1. **Use relative units** - Consider using `rem` instead of `px` for better scaling
2. **Test at all sizes** - Ensure your layout works at all font size settings
3. **Provide clear controls** - Make font size controls easy to find and use
4. **Persist preference** - Always save user preference (enabled by default)
5. **Respect system settings** - Consider reading system font size preferences

## Browser Compatibility

Works in all modern browsers that support:
- CSS Custom Properties
- localStorage API
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
- [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) - Theme management with dark mode support
- [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) - Toast notification system
- [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) - Scroll position tracking

## Troubleshooting

### Font size not persisting?

Make sure localStorage is enabled and not blocked by privacy settings.

### CSS variables not updating?

Ensure you're using the correct variable name in your CSS (`--base-font-size` by default) and that you've called `init()`.

### Layout breaking at larger sizes?

Test your responsive design at all font sizes. Use relative units and flexible layouts.

### TypeScript errors?

Ensure you have Angular 22+ and TypeScript 6.0+ installed.

## Support

- Found a bug? [Open an issue](https://github.com/Greezaaa/settings-utils-lib/issues)
- Have a feature request? [Start a discussion](https://github.com/Greezaaa/settings-utils-lib/discussions)
- Like this library? [Give it a star!](https://github.com/Greezaaa/settings-utils-lib)

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/font-size/LICENSE) file for details.