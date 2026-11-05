# ScrollSpy

`@su-labs/scroll-spy`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/scroll-spy?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/scroll-spy?style=for-the-badge)

A lightweight Angular service and directive for managing active sections based on scroll position. Easily track which section of a page is currently visible and update your UI accordingly. Perfect for navigation menus, table of contents, or one-page scroll applications.

> **Not using Angular?** The same scroll spy is available for React, Svelte and vanilla JavaScript in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core). See the [installation guides](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/README.md).

## Table of Contents

- [Why Use This Library?](#why-use-this-library)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Browser Compatibility](#browser-compatibility)
- [Related Libraries](#related-libraries)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

## Why Use This Library?

- **Lightweight** - Minimal bundle size
- **Reactive** - Built with Angular Signals
- **Performant** - Uses IntersectionObserver API
- **Flexible** - Works with any layout
- **Type-Safe** - Full TypeScript support
- **Zero Dependencies** - No bloat
- **Well Tested** - Comprehensive test coverage
- **Well Documented** - Clear examples and API docs

## Features

- Track the currently visible section on the page
- Reactive Signals for seamless integration with Angular
- Works with multiple sections
- Optional directive to automatically update the active section using IntersectionObserver
- Fully modular: use the service alone, or combine with the directive for automatic detection
- Configurable intersection thresholds

## Installation

You can install this library via npm:

```sh
npm install @su-labs/scroll-spy
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^22 @angular/core@^22
```

## Quick Start

```typescript
// 1. Install
npm install @su-labs/scroll-spy

// 2. Add directive to your sections
@for (section of sections; track section.id) {
  <section [id]="section.id" [appScrollSpy]="section.id">
    <h2>{{ section.name }}</h2>
  </section>
}

// 3. Track active section in navigation
@for (section of sections; track section.id) {
  <a
    [href]="'#' + section.id"
    [class.active]="activeSection() === section.id"
  >
    {{ section.name }}
  </a>
}

// 4. Inject service in component
import { Component, inject } from '@angular/core';
import { ScrollSpyService } from '@su-labs/scroll-spy';

export class AppComponent {
  scrollSpyService = inject(ScrollSpyService);
  activeSection = this.scrollSpyService.activeSection;
}
```

## Usage

### Using the service and directive

The most common usage is to combine the `ScrollSpyService` with the `ScrollSpyDirective` to create an automatic, reactive scroll-spy solution.

#### Attach the directive to your sections

In your component template, apply the `appScrollSpy` directive to each section you want to track. The input value should be a unique ID for that section. It's a good practice to also set the `id` attribute for anchor links.

```html
@for (section of sections; track section.id) {
  <a
    [href]="'#' + section.id"
    [class.active]="activeSection() === section.id"
  >
    {{ section.name }}
  </a>
}

@for (section of sections; track section.id) {
  <section [id]="section.id" [appScrollSpy]="section.id">
    <h2>{{ section.name }}</h2>
    <p>Content for the {{ section.name }} section...</p>
  </section>
}
```

#### Inject the service into your component

Because the `ScrollSpyService` is provided at the root level, you can simply inject it into any component. Directly assign the `activeSection` signal to a property to use it in your template.

```ts
import { Component, inject, signal } from '@angular/core';
import { ScrollSpyService, ScrollSpyDirective } from '@su-labs/scroll-spy';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-scroll-example',
  templateUrl: './scroll-example.component.html',
  standalone: true,
  imports: [ScrollSpyDirective, NgClass]
})
export class ScrollExampleComponent {
  private readonly scrollSpyService = inject(ScrollSpyService);
  activeSection = this.scrollSpyService.activeSection;

  sections = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'services', name: 'Services' },
    { id: 'contact', name: 'Contact' }
  ];
}
```

## API Reference

### Service (ScrollSpyService)

#### Signals

| Signal | Type | Description |
|--------|------|-------------|
| `activeSection()` | `string` | ID of currently active section (`''` until a section becomes active) |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setActiveSection(id)` | `string` | Manually set active section |

### Directive (ScrollSpyDirective)

#### Inputs

| Input | Type | Description |
|-------|------|-------------|
| `appScrollSpy` | `string` | Section ID to track |

#### How to Use

```html
<section [appScrollSpy]="'section-id'">
  <!-- Your content -->
</section>
```

## How It Works

The `ScrollSpyDirective` uses the browser's native [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to efficiently monitor when elements enter or exit the viewport. It's configured to trigger when a tracked section is roughly in the vertical center of the screen, providing a smooth and accurate "spy" effect.

**Key Benefits:**
- **Performance**: No scroll event listeners needed
- **Accuracy**: Precise intersection detection
- **Efficiency**: Browser-native implementation
- **Battery Friendly**: Optimized for mobile devices

## Browser Compatibility

Works in all modern browsers that support:
- IntersectionObserver API
- Angular 22+
- ES2022+

| Browser | Version |
|---------|---------|
| Chrome | ≥ 58 |
| Firefox | ≥ 55 |
| Safari | ≥ 12.1 |
| Edge | ≥ 16 |

## Related Libraries

Part of the **@su-labs** suite:

- [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker) - User visit tracking
- [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) - Theme management with dark mode support
- [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) - Toast notification system
- [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size) - Accessible font size controls

## Troubleshooting

### Active section not updating?

Make sure you've added the `appScrollSpy` directive to all sections you want to track.

### Multiple sections active at once?

This shouldn't happen with the default configuration. Check that section IDs are unique.

### Directive not found?

Make sure you've imported `ScrollSpyDirective` in your component's imports array (for standalone components).

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

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/scroll-spy/LICENSE) file for details.