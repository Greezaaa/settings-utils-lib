# Angular Guide

Angular has dedicated packages that wrap each utility in an injectable service with signals. Use these instead of `@su-labs/core`.

[All guides](../README.md)

## Installation

Install only the utilities you need:

```bash
npm install @su-labs/theme
npm install @su-labs/font-size
npm install @su-labs/notifications
npm install @su-labs/scroll-spy
npm install @su-labs/visit-tracker
```

Requires Angular 22 or later.

## Packages

| Package | What it does | Setup and API |
|---------|--------------|---------------|
| `@su-labs/theme` | Light, dark, contrast and system themes with CSS variables | [README](../../projects/su-labs/theme/README.md) |
| `@su-labs/font-size` | Accessible font size controls | [README](../../projects/su-labs/font-size/README.md) |
| `@su-labs/notifications` | Toast notifications | [README](../../projects/su-labs/notifications/README.md) |
| `@su-labs/scroll-spy` | Active section tracking while scrolling | [README](../../projects/su-labs/scroll-spy/README.md) |
| `@su-labs/visit-tracker` | Visit counts and milestones | [README](../../projects/su-labs/visit-tracker/README.md) |

## Theme quick start

Initialize the service when the app starts:

```ts
// app.config.ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuThemeService).init({ defaultTheme: 'system' });
    }),
  ],
};
```

Read the theme as a signal and switch it:

```ts
import { Component, inject } from '@angular/core';
import { SuThemeService } from '@su-labs/theme';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <p>Current theme: {{ themeService.theme() }}</p>
    <button type="button" (click)="themeService.setTheme('dark')">Dark</button>
    <button type="button" (click)="themeService.setTheme('system')">System</button>
  `,
})
export class ThemeSwitcherComponent {
  protected readonly themeService = inject(SuThemeService);
}
```

`@su-labs/theme`, `@su-labs/font-size`, `@su-labs/notifications`, `@su-labs/scroll-spy` and `@su-labs/visit-tracker` use `@su-labs/core` internally and install it automatically.

## Next steps

- [Theme configuration and full API](../../projects/su-labs/theme/README.md)
