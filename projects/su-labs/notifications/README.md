# Notifications

`@su-labs/notifications`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/notifications?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/notifications?style=for-the-badge)

A highly customizable Angular notification library built with modern practices, including reactive Signals. Easily display different types of notifications with various positions, custom icons, and optional auto-closing behavior.

> **Not using Angular?** The same notification logic is available for React, Svelte, vanilla JavaScript and Node in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core). See the [installation guides](https://github.com/Greezaaa/settings-utils-lib/blob/main/docs/README.md).

## Table of Contents

- [Why Use This Library?](#why-use-this-library)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Styling](#styling)
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
- **Customizable** - Multiple themes and positions
- **Icon Support** - Default SVG or custom icons
- **Auto-dismiss** - Configurable duration
- **Type-Safe** - Full TypeScript support
- **Zero Dependencies** - No bloat
- **Well Tested** - Comprehensive test coverage
- **Well Documented** - Clear examples and API docs

## Features

- **Reactive Core:** Built on Angular Signals for optimal performance and reactive updates.
- **Multiple Positions:** Notifications can be displayed in six different positions (`top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`).
- **Customizable:** Easily change themes, icons, and CSS classes to match your application's design system.
- **Icon Support:**
  - Default Icons: Render a default SVG icon based on the notification type.
  - Custom Icons: Use a custom SVG string or an image URL as an icon.
- **Dismissible:** Notifications can be dismissed manually or set to auto-close after a specified duration.
- **Declarative Usage:** Add a single component to your root template and use the service from anywhere in your application.

## Installation

You can install this library via npm:

```sh
npm install @su-labs/notifications
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^22 @angular/core@^22
```

## Quick Start

```typescript
// 1. Install
npm install @su-labs/notifications

// 2. Add component to your app template
// app.component.html
<su-notifications></su-notifications>
<router-outlet></router-outlet>

// 3. Show notifications from any component
import { Component, inject } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';

@Component({
  template: `<button (click)="showSuccess()">Show Success</button>`
})
export class AppComponent {
  notificationService = inject(SuNotificationService);

  showSuccess() {
    this.notificationService.show({
      type: 'success',
      message: 'Operation completed!'
    });
  }
}
```

## Usage

### 1. Add the component to your application

Add the `<su-notifications></su-notifications>` component to your root `AppComponent` or `index.html` file. This component acts as a container for all notifications.

```html
<!-- src/app/app.component.html -->
<su-notifications></su-notifications>
<router-outlet></router-outlet>
```

### 2. Inject the service and show a notification

Inject the `SuNotificationService` into any component or service and call its `show()` method to display a new notification.

```ts
// src/app/my-example.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuNotificationService } from '@su-labs/notifications';

@Component({
  selector: 'app-my-example',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="example-container">
      <button (click)="showSuccess()">Show Success</button>
      <button (click)="showError()">Show Error</button>
      <button (click)="showCustom()">Show Custom Icon</button>
    </div>
  `
})
export class MyExampleComponent {
  private readonly notificationService = inject(SuNotificationService);

  showSuccess(): void {
    this.notificationService.show({
      type: 'success',
      message: 'Your action was successful!'
    });
  }

  showError(): void {
    this.notificationService.show({
      type: 'error',
      message: 'Something went wrong. Please try again.'
    });
  }

  showCustom(): void {
    this.notificationService.show({
      type: 'info',
      message: 'This is a custom icon notification.',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
    });
  }
}
```

### 3. Customize the position

You can configure the global position of all notifications by directly setting the position property on the service instance. This is best done during application initialization.

```ts
// src/app/app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { SuNotificationService } from '@su-labs/notifications';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const notificationService = inject(SuNotificationService);
      notificationService.position = 'bottom-left';
    }),
    // other providers
  ],
};
```

Notifications slide in from the side they sit on (from the left here). To slide them in from another direction, whatever the position, set `slideFrom` to `'left'`, `'right'`, `'top'` or `'bottom'` (`'auto'` is the default):

```ts
notificationService.configure({ position: 'top-right', slideFrom: 'top' });
```

## API Reference

### Service (SuNotificationService)

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | `NotificationPosition` |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `show(config)` | `NotificationConfig` | Display a new notification |
| `dismiss(id)` | `string` | Manually dismiss a notification |

### Types

```typescript
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'custom';

type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'top-center' 
  | 'bottom-center';

interface NotificationConfig {
  type: NotificationType;
  message: string;
  duration?: number;        // Default: 3000ms
  autoClose?: boolean;      // Default: true
  cssClass?: string;        // Custom CSS class
  icon?: string;            // Custom SVG string or image URL
  actions?: NotificationAction[]; // Buttons under the message
}

interface NotificationAction {
  label: string;            // Button text
  onClick: () => void;      // Called when the button is pressed
  dismiss?: boolean;        // Close the notification afterwards (default: true)
}
```

### Action buttons

Give a notification `actions` to show buttons under its message, for example to undo or to open a page. Each button closes the notification after its `onClick` runs, unless it sets `dismiss: false`. Combine with `autoClose: false` to keep the notification until the user answers:

```typescript
this.notifications.show({
  type: 'info',
  message: 'Photo deleted',
  autoClose: false,
  actions: [
    { label: 'Undo', onClick: () => this.restorePhoto() },
    { label: 'OK', onClick: () => {} },
  ],
});
```

## Configuration Options

### Notification Types

| Type | Description |
|------|-------------|
| `info` | Informational message |
| `success` | Success message |
| `warning` | Warning message |
| `error` | Error message |
| `custom` | Custom styled message |

### Positions

| Position | Description |
|----------|-------------|
| `top-right` | Top right corner (default) |
| `top-left` | Top left corner |
| `top-center` | Top center |
| `bottom-right` | Bottom right corner |
| `bottom-left` | Bottom left corner |
| `bottom-center` | Bottom center |

## Styling

Notifications slide in from the side of the screen they appear on and slide back out when they close (they simply appear and disappear for visitors who prefer reduced motion). Every part of a notification can be restyled with CSS variables, set on `:root` or any parent element. For example, to let long messages use more width:

```css
:root {
  --su-notification-max-width: min(100% - 2rem, 26rem);
}
```

| Variable | Default | Controls |
|----------|---------|----------|
| `--su-notification-width` | `max-content` | Width of a notification; by default it fits its text |
| `--su-notification-max-width` | `min(100% - 2rem, 300px)` | Widest a notification gets before its text wraps |
| `--su-notification-padding-block` | `1rem` | Space above and below the text |
| `--su-notification-padding-inline` | `1.25rem` | Space left and right of the text |
| `--su-notification-container-gap` | `1.2rem` | Space between stacked notifications |
| `--su-notification-container-position` | `1rem` | Distance from the edges of the screen |
| `--su-notification-enter-duration` | `400ms` | How long a notification takes to slide in from its side of the screen |
| `--su-notification-leave-duration` | `300ms` | How long it takes to slide back out when closed |
| `--su-notification-background-color` | `#fff` | Background |
| `--su-notification-text-color` | `#333` | Text |
| `--su-notification-box-shadow` | `rgba(0, 0, 0, 0.15)` | Shadow colour |
| `--su-notification-info-border-color` | `#2196f3` | Left border of `info` (likewise `success`, `warning`, `error`, `custom`) |
| `--su-notification-icon-color` | `currentColor` | Icon colour |
| `--su-notification-icon-width` / `-height` | `24px` | Icon size |
| `--su-notification-action-border-color` | `currentColor` | Border of action buttons (they take the notification's text colour) |
| `--su-notification-close-btn-size` | `20px` | Close button size |
| `--su-notification-close-btn-background-color` | the background | Close button background (also `-text-color`, `-border-color`, `-border-radius`, `-font-size`, `-hover-background`, `-hover-color`) |

## How It Works

The library consists of a stateless service (`SuNotificationService`) and a presentational component (`SuNotificationComponent`).

The service manages a list of notifications using a private Signal. When you call `service.show()`, it adds a new notification object to the signal's array. The component then reads from this signal and automatically renders a notification for each item in the array. This approach keeps the state management decoupled from the UI, making it highly flexible and testable.

The component's icons are rendered using `[innerHTML]` to safely inject SVG markup into the template. Angular's `DomSanitizer` is used to prevent security risks like Cross-Site Scripting (XSS) attacks.

## Browser Compatibility

Works in all modern browsers that support:
- CSS Flexbox
- CSS Animations
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
- [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) - Scroll position tracking
- [@su-labs/font-size](https://www.npmjs.com/package/@su-labs/font-size) - Accessible font size controls

## Troubleshooting

### Notifications not showing?

Make sure you've added `<su-notifications></su-notifications>` to your root component template.

### Icons not displaying?

If using custom icons, ensure the SVG string is valid. For security, Angular sanitizes HTML by default.

### Position not changing?

Set the position property during app initialization using `provideAppInitializer`.

### TypeScript errors?

Ensure you have Angular 22+ and TypeScript 6.0+ installed.

## Support

- Found a bug? [Open an issue](https://github.com/Greezaaa/settings-utils-lib/issues)
- Have a feature request? [Start a discussion](https://github.com/Greezaaa/settings-utils-lib/discussions)
- Like this library? [Give it a star!](https://github.com/Greezaaa/settings-utils-lib)

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [GitHub repository](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/notifications/LICENSE) file for details.