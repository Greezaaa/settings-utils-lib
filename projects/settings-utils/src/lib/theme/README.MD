# SuThemeService

A robust and reactive Angular service for managing application themes. It provides a full-featured solution that supports dynamic switching, user preference persistence, and automatic system theme detection.


## Features

- Reactive State: Uses Angular signals for efficient, reactive theme management.

- System Theme Integration: Automatically follows the user's system theme preference (`prefers-color-scheme`).

- Persistence: Remembers the user's last-selected theme using `localStorage`.

- Configurable: Customizable with a configuration object for storage keys, CSS variable prefixes, and default themes.

- Programmatic Control: Simple public API to set, get, and track the active theme.

## Available Themes

The service currently supports the following theme names by default:

- `light`
- `dark`
- `contrast`
- `custom`
- `system` (follows OS preference)

Custom themes can be added via the `variables` property in `SuThemeConfig`.


## Usage

The `SuThemeService` must be initialized at application startup to load its configuration and initial theme. This is best done with an `APP_INITIALIZER`.

### Example 1: Global Initialization with `APP_INITIALIZER`

```typescript 
// main.ts or app.config.ts
import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { SuThemeService, SuThemeConfig } from './path/to/su-theme.service';

const myThemeConfig: SuThemeConfig = {
  // Optional: Set a default theme if none is saved
  defaultTheme: 'dark', 
  // Optional: Provide custom CSS variables for any theme
  variables: {
    color: '#333',
    background: '#eee',
    'main-accent': '#007bff'
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (themeService: SuThemeService) => () => themeService.init(myThemeConfig),
      deps: [SuThemeService],
      multi: true
    }
  ],
};
```

✅ This ensures the theme is loaded and applied before the application renders. The `SuThemeService` handles all the logic internally, including loading from `localStorage` and applying the initial theme.

--- 

### Example 2: Example 2: Using the Theme in a Component
Your service applies CSS variables automatically based on the theme. You can use these variables in your global or component-level stylesheets.

```css
/* styles.css */
/* These variables are the default for the 'light' theme */
:root {
  --su-theme-color: #333;
  --su-theme-background: #fff;
}

[data-theme='dark'] {
  --su-theme-color: #eee;
  --su-theme-background: #222;
}

/* Here is how you would define your 'contrast' theme */
[data-theme='contrast'] {
  --su-theme-color: #000;
  --su-theme-background: #fff;
  filter: grayscale(100%) contrast(200%); /* Example high-contrast filter */
}

/* Here is how you would define your 'custom' theme */
[data-theme='custom'] {
  --su-theme-color: #ff00ff;
  --su-theme-background: #00ffff;
  --su-theme-main-accent: #ff9800;
}
```
Calling applyCssVariables updates these values dynamically.

---

### Example 3: Dynamic Theme Switching
Use the `setTheme()` method to switch themes and the `theme` signal to read the current state.

```typescript
import { Component, inject, signal } from '@angular/core';
import { SuThemeService, SuThemeName } from './path/to/su-theme.service';

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
  // Use the service directly in the template
  public readonly themeService = inject(SuThemeService);

  setTheme(themeName: SuThemeName) {
    this.themeService.setTheme(themeName);
  }
}
};

```
✅ This correctly shows how to use your service's public API to switch between themes. The service handles the underlying logic, including persistence and CSS variable application.
---

## Notes

- The service safely handles properties and ignores null or undefined values, preventing issues like prototype pollution.

- Works seamlessly with standalone components and reactive setups thanks to its signal-based API.

- **Persistence is handled automatically:** The service saves the user's preference to `localStorage` when you call `setTheme(..., true)`. On initialization, it automatically restores this saved preference. You do not need to add this logic in your components.