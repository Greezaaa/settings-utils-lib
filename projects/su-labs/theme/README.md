# SuThemeService

A robust and reactive Angular service for managing application themes. It provides a full-featured solution that supports dynamic switching, user preference persistence, and automatic system theme detection.

## Features

* Reactive State: Uses Angular signals for efficient, reactive theme management.
* System Theme Integration: Automatically follows the user's system theme preference (`prefers-color-scheme`).
* Persistence: Remembers the user's last-selected theme using `localStorage`.
* Configurable: Customizable with a configuration object for storage keys, CSS variable prefixes, and default themes.
* Programmatic Control: Simple public API to set, get, and track the active theme.

## Available Themes

The service currently supports the following theme names by default:

* `light`
* `dark`
* `contrast`
* `custom`
* `system` (follows OS preference)

You can provide custom variables for any of these themes via the `themes` property in `SuThemeConfig`.

## Usage

The `SuThemeService` must be initialized at application startup to load its configuration and initial theme.

### Example 1: Global Initialization with provideAppInitializer

```typescript
// main.ts or app.config.ts
import { provideAppInitializer, inject } from '@angular/core';
import { SuThemeService, SuThemeConfig } from './path/to/su-theme.service';

const myThemeConfig: SuThemeConfig = {
  // Optional: Set a default theme if none is saved
  defaultTheme: 'dark',
  // Optional: Provide custom CSS variables for any theme
  themes: {
    dark: {
      color: '#333',
      background: '#eee',
      'main-accent': '#007bff',
    },
  },
};

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      const themeService = inject(SuThemeService);
      themeService.init(myThemeConfig);
    }),
  ],
};
```

✅ This ensures the theme is loaded and applied before the application renders. The `SuThemeService` handles all the logic internally, including loading from `localStorage` and applying the initial theme.

###	Example 2: Using the Theme in a Component
Your service automatically applies CSS variables to the `:root` element. Your application stylesheets can use these variables, and the service will handle updating their values when the theme changes.

```CSS

/* styles.css */
/* Use the CSS variables in your stylesheet */
body {
  color: var(--su-theme-color);
  background-color: var(--su-theme-background);
}

h1 {
  color: var(--su-theme-main-accent);
}
```

The service dynamically updates these variables based on the active theme, applying a combination of its internal defaults and any custom overrides you provide in the configuration.

###	Example 3: Dynamic Theme Switching
Use the setTheme() method to switch themes and the theme signal to read the current state.

```TypeScript

import { Component, inject } from '@angular/core';
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
```
 
✅ This correctly shows how to use your service's public API to switch between themes. The service handles the underlying logic, including persistence and CSS variable application.

## Configuration Options

The service can be configured to fit your application's needs.

| Option             | Description                                                   | Default Value    |
|--------------------|---------------------------------------------------------------|------------------|
| `storageKey`       | The key used to persist the selected theme in `localStorage`. | `'su:theme'`     |
| `cssVarPrefix`     | The prefix for all CSS variables managed by the service.      | `'--su-theme-'`  |
| `defaultTheme`     | The theme to use if no preference is saved in `localStorage`. | `'system'`       |
| `themes`           | An object with custom CSS variable overrides for each theme.  | `undefined`      |

##	Notes
- The service safely handles properties and ignores null or undefined values, preventing issues like prototype pollution.

-	Works seamlessly with standalone components and reactive setups thanks to its signal-based API.

-	Persistence is handled automatically: The service saves the user's preference to `localStorage` when you call `setTheme(..., true)`. On initialization, it automatically restores this saved preference. You do not need to add this logic in your components.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/theme/LICENSE) file for details.

