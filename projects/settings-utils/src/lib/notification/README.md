# SuNotificationService
A reactive, configurable, and lightweight notification service for Angular applications. It uses signals for efficient state management and provides a flexible API for displaying various types of notifications.

## Features
- Reactive state management with Angular signals.
- Configurable notification position (`top-right`, `bottom-left`, etc.).
- Multiple notification types: success, `info`, `warning`, `error`, and `custom`.
- Support for custom icons, including default SVG icons, image URLs, or inline SVG markup.
- Auto-closing notifications with configurable duration.
- Programmatic dismissal of individual or all notifications.
- Customizable appearance via CSS variables.

## Usage
### 1. Include the Component in your Application
To make the notification system available throughout your app, add the `SuNotificationComponent` to your root component's template (`app.component.html`).

```HTML

<router-outlet></router-outlet>
<su-lib-notifications></su-lib-notifications>
```

### 2. Provide and Configure the Service
The `SuNotificationService` is provided at the root level (`@Injectable({ providedIn: 'root' })`), so it is ready to be injected. You can optionally configure its global position using an `APP_INITIALIZER`.

```TypeScript

// app.config.ts or main.ts
import { ApplicationConfig, provideAppInitializer } from '@angular/core';
import { SuNotificationService } from './notification.service';
import { inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const notificationService = inject(SuNotificationService);
      return () => {
        // Optional: configure the default position
        notificationService.configure({ position: 'bottom-left' }); 
      };
    }),
  ],
};
```

### 3. Using the service in components
Inject the service into any component or service and use its methods to manage notifications.

```TypeScript

import { Component, inject } from '@angular/core';
import { SuNotificationService, SuNotificationOptions } from './path/to/notification.service';

@Component({
  selector: 'app-notification-example',
  template: `
    <button (click)="showSuccess()">Show Success</button>
    <button (click)="showPersistentInfo()">Show Info</button>
    <button (click)="showCustom()">Show Custom</button>
  `,
})
export class NotificationExampleComponent {
  private readonly notificationService = inject(SuNotificationService);

  showSuccess(): void {
    const options: SuNotificationOptions = {
      message: 'Operation completed successfully!',
      type: 'success',
      duration: 5000,
    };
    this.notificationService.show(options);
  }

  showPersistentInfo(): void {
    this.notificationService.show({
      message: 'This notification will stay until you close it.',
      type: 'info',
      autoClose: false,
    });
  }

  showCustom(): void {
    this.notificationService.show({
      message: 'Notification with custom icon.',
      type: 'custom',
      icon: '<svg viewBox="0 0 24 24" fill="none" ...>...</svg>', // Inline SVG
      cssClass: 'my-custom-class', // For custom styling
    });
  }

  dismissAll(): void {
    this.notificationService.clearAll();
  }
}
```

### SuNotificationOptions
The `show()` method accepts an object with the following properties:

- `type`: `SuNotificationType` (`'info', 'success', 'warning', 'error', 'custom'`). Required.

- `message`: `string`. The main text message. Required.

- `duration?`: `number`. Milliseconds before the notification auto-closes. Default is `3000`.

- `autoClose?`: `boolean`. If false, the notification will not auto-close. Default is `true`.

- `cssClass?`: `string`. A custom CSS class for additional styling.

- `icon?`: `boolean` | `string`.

	- true: Uses the default SVG icon for the type.
	- false: No icon is displayed.
	- string: A URL to an image (.svg, .png, etc.) or inline SVG markup.

### SuNotificationPosition
The following positions are available for configuration:
`'top-right'`, `'top-left'`, `'bottom-right'`, `'bottom-left'`, `'top-center'`, `'bottom-center'`.

### Customization
You can easily customize the appearance of notifications by overriding CSS variables. This can be done in a global stylesheet.

Example: Customizing a notification's color

```CSS

/* In your global styles.scss */
.notification {
  --su-notification-text-color`: #fff3e0;
  --su-notification-warning-border-color: #e65100;
  ... other properties
}
```

###	 Available CSS Variables:

Container Variables

- `--su-notification-container-gap`: Gap between notifications.
- `--su-notification-container-position`: Distance from viewport edges
- `--su-notification-width`: Width of a notification. 
- `--su-notification-max-width`: Maximum width of a notification.

Notification Variables
- `--su-notification-background-color`: Notification background color.
- `--su-notification-text-color`: Notification text color.
- `--su-notification-box-shadow`: Box shadow.
- `--su-notification-padding-block`: Vertical padding.
- `--su-notification-padding-inline`: Horizontal padding.
- `--su-notification-border-radius`: Border radius.

Type Colors
- `--su-notification-success-border-color`: Border color for success notifications.
- `--su-notification-info-border-color`: Border color for info notifications.
- `--su-notification-warning-border-color`: Border color for warning notifications.
- `--su-notification-error-border-color`: Border color for error notifications.
- `--su-notification-custom-border-color`: Border color for custom notifications.

Icon Variables
- `--su-notification-icon-width`: Icon container width.
- `--su-notification-icon-height`: Icon container height.
- `--su-notification-icon-color`: Color for inline SVGs or icons.

Close Button Variables
- `--su-notification-close-btn-size`: Close button size.
- `--su-notification-close-btn-font-size`: Close button font size.
- `--su-notification-close-btn-background-color`: Close button background color.
- `--su-notification-close-btn-text-color`: Close button text color.
- `--su-notification-close-btn-border-color`: Close button border color.
- `--su-notification-close-btn-border-radius`: Close button border radius.
- `--su-notification-close-btn-hover-background`: Close button hover background.
- `--su-notification-close-btn-hover-color`: Close button hover color.
