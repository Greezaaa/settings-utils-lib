# SuVisitTrackerService

`@su-labs/visit-tracker`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/visit-tracker?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/visit-tracker?style=for-the-badge)

A lightweight Angular service to track user visits. Provides reactive signals for visit count, last visit date, and milestone visits.

> **Not using Angular?** The same visit tracker is available for React, Svelte and vanilla JavaScript in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core). See the [installation guides](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/README.md).

## Table of Contents

- [Why Use This Library?](#why-use-this-library)
- [Features](#features)
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
- **Type-Safe** - Full TypeScript support
- **SSR Safe** - No browser APIs are touched on the server
- **Well Tested** - Comprehensive test coverage
- **Well Documented** - Clear examples and API docs

## Features

* Tracks number of visits per user.
* Persists visit data in `localStorage`.
* Milestone signal (e.g., 10th, 100th visit).
* Reactive last visit date signal.
* Configurable storage key and milestones.
* Works seamlessly with standalone components and reactive Angular setups.

## Installation

You can install this library via npm:

```sh
npm install @su-labs/visit-tracker
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^22 @angular/core@^22
```

## Quick Start

1. Record the visit once at startup in `app.config.ts`:

```typescript
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuVisitTrackerService).init();
    }),
  ],
};
```

2. Read the signals in any component:

```typescript
import { Component, inject } from '@angular/core';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';

@Component({
  selector: 'app-root',
  template: `<p>Visits: {{ visitService.count() }}</p>`,
})
export class AppComponent {
  protected readonly visitService = inject(SuVisitTrackerService);
}
```

## Usage

### Example 1: Welcome back message
After `init()` has run (see [Quick Start](#quick-start)), inject the service wherever you need it:

```TypeScript
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';

@Component({
  selector: 'app-root',
  imports: [DatePipe],
  template: `
    <h1>Welcome back!</h1>
    <p>You have visited {{ visitService.count() }} times.</p>
    @if (visitService.lastVisit(); as last) {
      <p>Last visit: {{ last | date: 'medium' }}</p>
    }
  `,
})
export class AppComponent {
  public readonly visitService = inject(SuVisitTrackerService);
}
```

Each `init()` call increments the visit count and saves the start of this visit for next time.

### Example 2: Checking milestone visits
`milestone()` holds the milestone reached on this visit, or `null`:

```HTML
@switch (visitService.milestone()) {
  @case (10) {
    <p>Congratulations on your 10th visit!</p>
  }
  @case (100) {
    <p>100 visits! You're a power user!</p>
  }
}
```

The signal is set when `init()` runs.

### Example 3: Custom configuration
For standalone apps, use provideAppInitializer to initialize the tracker with a custom storage key or milestones:

```TypeScript
import { provideAppInitializer, inject } from '@angular/core';
import { SuVisitTrackerService, SuVisitTrackerConfig } from '@su-labs/visit-tracker';

const visitConfig: SuVisitTrackerConfig = {
  storageKey: 'myApp:visits',
  milestoneVisits: [5, 50, 500], // custom milestones
};

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      const tracker = inject(SuVisitTrackerService);
      tracker.init(visitConfig);
    }),
  ],
};
```

Allows overriding the localStorage key and defining custom milestone visits.

### Example 4: Using last visit date

```HTML
@if (visitService.lastVisit(); as last) {
  <p>
    Your last visit was on {{ last | date:'fullDate' }} at {{ last | date:'shortTime' }}
  </p>
}
```

The service stores last visit as an ISO string (e.g., "2025-08-25T12:34:56.789Z"), so it can easily be used in Angular date pipes.

## API Reference

### Signals

| Signal | Type | Description |
|--------|------|-------------|
| `count()` | `number` | Visit count including this visit (`0` before `init()`) |
| `lastVisit()` | `string \| null` | Start of the previous visit as an ISO string, or `null` on the first visit |
| `milestone()` | `number \| null` | Milestone reached on this visit, or `null` |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init(config?)` | `SuVisitTrackerConfig` | Record the current visit. Call once at startup. |

### Types

```typescript
interface SuVisitTrackerConfig {
  storageKey?: string;        // Default: 'su:visits'
  milestoneVisits?: number[]; // Default: [10, 100]
}
```

## Configuration Options

The service can be configured to fit your application's needs. You can customize the storage key and milestone values by passing a configuration object to the `init()` method.

| Option            | Description                                                   | Default Value    |
|-------------------|---------------------------------------------------------------|------------------|
| `storageKey`      | The key used to persist the visit data in `localStorage`.     | `'su:visits'`    |
| `milestoneVisits` | An array of numbers representing visits to track as milestones. | `[10, 100]`      |

## Browser Compatibility

Works in all modern browsers that support:
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

- [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) - Theme management with dark mode support
- [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) - Toast notification system
- [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) - Scroll position tracking
- [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size) - Accessible font size controls

## Troubleshooting

### Visit count not persisting?

Make sure localStorage is enabled in your browser and not blocked by privacy settings.

### Count stays at 0?

The visit is only recorded when `init()` runs. Call it once at startup, as shown in [Quick Start](#quick-start).

### Milestone signal not updating?

Milestones are only checked when `init()` runs, once per visit.

### TypeScript errors?

Ensure you have Angular 22+ and TypeScript 6.0+ installed.

## Support

- Found a bug? [Open an issue](https://github.com/Greezaaa/settings-utils-lib/issues)
- Have a feature request? [Start a discussion](https://github.com/Greezaaa/settings-utils-lib/discussions)
- Like this library? [Give it a star!](https://github.com/Greezaaa/settings-utils-lib)

## Notes

- **Signals-based API**: Perfect for standalone components and reactive Angular templates.
- **Persistence**: Visit count and last visit are automatically stored in localStorage.
- **Lightweight**: Minimal memory footprint.
- **Custom milestones**: Track any number of user visit milestones reactively.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/visit-tracker/LICENSE) file for details.