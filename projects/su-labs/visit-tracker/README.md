# SuVisitTrackerService

A lightweight Angular service to track user visits. Provides reactive signals for visit count, last visit date, and milestone visits.

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
npm install @angular/common@^20.1.0 @angular/core@^20.1.0
```

## Usage
### Example 1: Basic initialization
The service should be provided at the root level. To use it in a component, simply inject it:

```TypeScript

import { Component, inject } from '@angular/core';
import { SuVisitTrackerService } from './su-visit-tracker.service';
import { CommonModule, DatePipe } from '@angular/common';

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
import { SuVisitTrackerService, SuVisitTrackerConfig } from './su-visit-tracker.service';

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

### Example 4: Using last visit date

```HTML

@if(visitService.lastVisit() as last) {
  <p>
    Your last visit was on {{ last | date:'fullDate' }} at {{ last | date:'shortTime' }}
  </p>
  }
```

The service stores last visit as an ISO string (e.g., "2025-08-25T12:34:56.789Z"), so it can easily be used in Angular date pipes.

## Configuration Options

The service can be configured to fit your application's needs. You can customize the storage key and milestone values by passing a configuration object to the `init()` method.

| Option            | Description                                                   | Default Value    |
|-------------------|---------------------------------------------------------------|------------------|
| `storageKey`      | The key used to persist the visit data in `localStorage`.     | `'su:visits'`    |
| `milestoneVisits` | An array of numbers representing visits to track as milestones. | `[10, 100]`      |

## Notes

- Signals-based API: Perfect for standalone components and reactive Angular templates.

- Persistence: Visit count and last visit are automatically stored in localStorage.

- Lightweight: No external dependencies and minimal memory footprint.

- Custom milestones: Track any number of user visit milestones reactively.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/visit-tracker/LICENSE) file for details.

