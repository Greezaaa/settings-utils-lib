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

`type`: `SuNotificationType` (`'info', 'success', 'warning', 'error', 'custom'`). Required.

`message`: `string`. The main text message. Required.

`duration?`: `number`. Milliseconds before the notification auto-closes. Default is `3000`.

`autoClose?`: `boolean`. If false, the notification will not auto-close. Default is `true`.

`cssClass?`: `string`. A custom CSS class for additional styling.

`icon?`: `boolean` | `string`.

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
.notification.my-custom-class {
  --su-background: #fff3e0;
  --su-color: #e65100;
  border-left-color: #ff9800;
}
```

###	 Available CSS Variables:

Container Variables:

`--su-gap`: Gap between notifications.

`--su-notification-width`: Width of a notification.

`--su-notification-max-width`: Maximum width of a notification.

`--su-notification-position`: Distance from viewport edges.


---

Notification Variables:

`--su-background`: Notification background color.

`--su-color`: Notification text color.

`--su-shadow`: Box shadow color.

`--su--padding-block`: Vertical padding.

`--su--padding-inline`: Horizontal padding.

`--su-border-radius`: Border radius.


---


Type Colors:

`--su-success`: Border color for success notifications.

`--su-info`: Border color for info notifications.

`--su-warning`: Border color for warning notifications.

`--su-error`: Border color for error notifications.

`--su-custom`: Border color for custom notifications.


---


Icon Variables:

`--su-icon-width`: Icon container width.

`--su-icon-height`: Icon container height.

`--su-icon-color`: Color for inline SVGs.


---


Close Button Variables:

`--su-btn-size`: Close button size.

`--close-btn-font-size`: Close button font size.

`--su-border-color`: Close button border color.

`--su-hover-background`: Close button hover background.

`--su-hover-color`: Close button hover color.


---
