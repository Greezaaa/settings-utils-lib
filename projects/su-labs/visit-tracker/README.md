# SuVisitTrackerService

`@su-labs/visit-tracker`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/visit-tracker?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/visit-tracker?style=for-the-badge)

A lightweight Angular service to track user visits. Provides reactive signals for visit count, last visit date, and milestone visits.

## 📚 Table of Contents

- [Why Use This Library?](#-why-use-this-library)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#-quick-start)
- [Usage](#usage)
- [API Reference](#-api-reference)
- [Configuration Options](#configuration-options)
- [Browser Compatibility](#-browser-compatibility)
- [Related Libraries](#-related-libraries)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)
- [Contributing](#contributing)
- [License](#license)

## 💡 Why Use This Library?

- 🎯 **Lightweight** - Only ~5KB minified
- ⚡ **Reactive** - Built with Angular Signals
- 🔒 **Type-Safe** - Full TypeScript support
- 📦 **Zero Dependencies** - No bloat
- 🧪 **Well Tested** - Comprehensive test coverage
- 📝 **Well Documented** - Clear examples and API docs

## Features

* Tracks number of visits per user.
* Persists visit data in `localStorage`.
* Signals for milestones (e.g., 10th, 100th visit).
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
npm install @angular/common@^21 @angular/core@^21
```

## 🚀 Quick Start

```typescript
// 1. Install
npm install @su-labs/visit-tracker

// 2. Inject in your component
import { Component, inject } from '@angular/core';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';

@Component({
  selector: 'app-root',
  template: `<p>Visits: {{ visitService.count() }}</p>`
})
export class AppComponent {
  visitService = inject(SuVisitTrackerService);
}
```

## Usage

### Example 1: Basic initialization
The service should be provided at the root level. To use it in a component, simply inject it:

```TypeScript
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SuVisitTrackerService } from '@su-labs/visit-tracker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <h1>Welcome back!</h1>
    <p>You have visited {{ visitService.count() }} times.</p>
    <ng-container *ngIf="visitService.lastVisit() as last">
      <p>Last visit: {{ last | date:'medium' }}</p>
    </ng-container>
  `,
})
export class AppComponent {
  public readonly visitService = inject(SuVisitTrackerService);
}
```

✅ Automatically increments the visit count and updates the last visit timestamp.

### Example 2: Checking milestone visits
You can reactively check if a milestone visit has been reached:

```HTML
@if(visitService.isTenthVisit()){
  <p>🎉 Congratulations on your 10th visit!</p>
}

@if(visitService.isHundredthVisit()){
  <p>🏆 100 visits! You're a power user!</p>
}
```

Signals `isTenthVisit` and `isHundredthVisit` update automatically on service initialization.

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

✅ Allows overriding the localStorage key and defining custom milestone visits.

### Example 4: Using last visit date

```HTML
@if(visitService.lastVisit() as last) {
  <p>
    Your last visit was on {{ last | date:'fullDate' }} at {{ last | date:'shortTime' }}
  </p>
}
```

The service stores last visit as an ISO string (e.g., "2025-08-25T12:34:56.789Z"), so it can easily be used in Angular date pipes.

## 📖 API Reference

### Signals

| Signal | Type | Description |
|--------|------|-------------|
| `count()` | `number` | Current visit count |
| `lastVisit()` | `string \| null` | ISO string of last visit date |
| `isTenthVisit()` | `boolean` | True if current count is 10 |
| `isHundredthVisit()` | `boolean` | True if current count is 100 |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init(config?)` | `SuVisitTrackerConfig` | Initialize with custom configuration |

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

## 🌐 Browser Compatibility

Works in all modern browsers that support:
- ✅ localStorage API
- ✅ Angular 21+
- ✅ ES2022+

| Browser | Version |
|---------|---------|
| Chrome | ≥ 90 |
| Firefox | ≥ 88 |
| Safari | ≥ 14 |
| Edge | ≥ 90 |

## 🔗 Related Libraries

Part of the **@su-labs** suite:

- 🎨 [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) - Theme management with dark mode support
- 🔔 [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) - Toast notification system
- 🔍 [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) - Scroll position tracking
- 📏 [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size) - Accessible font size controls

## 🔧 Troubleshooting

### Visit count not persisting?

Make sure localStorage is enabled in your browser and not blocked by privacy settings.

### Milestone signals not updating?

Milestones are only checked during service initialization. Call `init()` to recalculate.

### TypeScript errors?

Ensure you have Angular 21+ and TypeScript 5.7+ installed.

## 💬 Support

- 🐛 Found a bug? [Open an issue](https://github.com/Greezaaa/settings-utils-lib/issues)
- 💡 Have a feature request? [Start a discussion](https://github.com/Greezaaa/settings-utils-lib/discussions)
- ⭐ Like this library? [Give it a star!](https://github.com/Greezaaa/settings-utils-lib)

## Notes

- **Signals-based API**: Perfect for standalone components and reactive Angular templates.
- **Persistence**: Visit count and last visit are automatically stored in localStorage.
- **Lightweight**: No external dependencies and minimal memory footprint.
- **Custom milestones**: Track any number of user visit milestones reactively.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/visit-tracker/LICENSE) file for details.