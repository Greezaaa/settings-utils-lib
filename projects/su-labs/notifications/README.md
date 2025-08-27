# Notifications

A highly customizable Angular notification library built with modern practices, including reactive Signals. Easily display different types of notifications with various positions, custom icons, and optional auto-closing behavior.

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
npm install @angular/common@">=20.1.0" @angular/core@">=20.1.0" @angular/platform-browser@">=20.1.0"
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
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
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

## How It Works

The library consists of a stateless service (`SuNotificationService`) and a presentational component (`SuNotificationComponent`).

The service manages a list of notifications using a private Signal. When you call `service.show()`, it adds a new notification object to the signal's array. The component then reads from this signal and automatically renders a notification for each item in the array. This approach keeps the state management decoupled from the UI, making it highly flexible and testable.

The component's icons are rendered using `[innerHTML]` to safely inject SVG markup into the template. Angular's `DomSanitizer` is used to prevent security risks like Cross-Site Scripting (XSS) attacks.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [GitHub repository](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/notifications/LICENSE) file for details.