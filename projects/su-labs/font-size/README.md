# Font Size

`@su-labs/font-size`

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Angular Version](https://img.shields.io/badge/Angular-v21-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Size](https://img.shields.io/badge/Size-Small-green.svg?style=for-the-badge)
![Downloads](https://img.shields.io/npm/dt/@su-labs/font-size?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/font-size?style=for-the-badge)

An accessible Angular service for managing font size preferences. Provides reactive controls for text scaling, user preference persistence, and WCAG-compliant font size management.

## 📚 Table of Contents

- [Why Use This Library?](#-why-use-this-library)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#-quick-start)
- [Usage](#usage)
- [API Reference](#-api-reference)
- [Configuration Options](#configuration-options)
- [Accessibility](#accessibility)
- [Browser Compatibility](#-browser-compatibility)
- [Related Libraries](#-related-libraries)
- [Troubleshooting](#-troubleshooting)
- [Support](#-support)
- [Contributing](#contributing)
- [License](#license)

## 💡 Why Use This Library?

- 🎯 **Lightweight** - Minimal bundle size
- ⚡ **Reactive** - Built with Angular Signals
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 💾 **Persistent** - Remembers user preference
- 🎨 **CSS Variables** - Modern implementation
- 🔒 **Type-Safe** - Full TypeScript support
- 📦 **Zero Dependencies** - No bloat
- 🧪 **Well Tested** - Comprehensive test coverage
- 📝 **Well Documented** - Clear examples and API docs

## Features

* **Reactive State**: Uses Angular signals for efficient, reactive font size management.
* **Persistence**: Remembers the user's font size preference using `localStorage`.
* **Multiple Presets**: Support for small, normal, large, and extra-large font sizes.
* **CSS Variables**: Applies font sizes using CSS custom properties for maximum flexibility.
* **Accessibility**: Helps users with visual impairments customize text size for better readability.
* **Configurable**: Customizable storage keys, CSS variable names, and size scales.

## Installation

You can install this library via npm:

```sh
npm install @su-labs/font-size
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^21 @angular/core@^21
```

## 🚀 Quick Start

```typescript
// 1. Install
npm install @su-labs/font-size

// 2. Initialize in app.config.ts
import { provideAppInitializer, inject } from '@angular/core';
import { SuFontSizeService } from '@su-labs/font-size';

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuFontSizeService).init();
    }),
  ],
};

// 3. Create font size controls
import { Component, inject } from '@angular/core';
import { SuFontSizeService } from '@su-labs/font-size';

@Component({
  template: `
    <button (click)="fontService.setSize('small')">A-</button>
    <button (click)="fontService.setSize('normal')">A</button>
    <button (click)="fontService.setSize('large')">A+</button>
    <p>Current: {{ fontService.size() }}</p>
  `
})
export class AppComponent {
  fontService = inject(SuFontSizeService);
}

// 4. Use CSS variables in your styles
body {
  font-size: var(--su-font-size-base);
}
```

## Usage

### Example 1: Basic Font Size Controls

```typescript
import { Component, inject } from '@angular/core';
import { SuFontSizeService, FontSize } from '@su-labs/font-size';

@Component({
  selector: 'app-font-controls',
  standalone: true,
  template: `
    <div class="font-controls">
      <h3>Text Size</h3>
      <div class="button-group">
        @for (size of fontSizes; track size) {
          <button 
            (click)="setFontSize(size)"
            [class.active]="fontService.size() === size"
          >
            {{ size | titlecase }}
          </button>
        }
      </div>
      <p>Current size: {{ fontService.size() }}</p>
    </div>
  `,
  styles: [`
    .button-group button.active {
      background-color: var(--su-theme-primary);
      color: white;
    }
  `]
})
export class FontControlsComponent {
  fontService = inject(SuFontSizeService);
  fontSizes: FontSize[] = ['small', 'normal', 'large', 'x-large'];

  setFontSize(size: FontSize) {
    this.fontService.setSize(size);
  }
}
```

### Example 2: Custom Configuration

```typescript
import { provideAppInitializer, inject } from '@angular/core';
import { SuFontSizeService, SuFontSizeConfig } from '@su-labs/font-size';

const fontConfig: SuFontSizeConfig = {
  defaultSize: 'normal',
  storageKey: 'myApp:fontSize',
  cssVarPrefix: '--app-font-',
  sizes: {
    small: '14px',
    normal: '16px',
    large: '18px',
    'x-large': '20px'
  }
};

export const appConfig = {
  providers: [
    provideAppInitializer(() => {
      inject(SuFontSizeService).init(fontConfig);
    }),
  ],
};
```

### Example 3: Using in Your Styles

```css
/* Global styles.css */
:root {
  --su-font-size-base: 16px;
  --su-font-size-small: 14px;
  --su-font-size-large: 18px;
}

body {
  font-size: var(--su-font-size-base);
}

h1 {
  font-size: calc(var(--su-font-size-base) * 2);
}

h2 {
  font-size: calc(var(--su-font-size-base) * 1.5);
}

.small-text {
  font-size: var(--su-font-size-small);
}

.large-text {
  font-size: var(--su-font-size-large);
}
```

## 📖 API Reference

### Service (SuFontSizeService)

#### Signals

| Signal | Type | Description |
|--------|------|-------------|
| `size()` | `FontSize` | Current font size setting |

#### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `init(config?)` | `SuFontSizeConfig` | Initialize with custom configuration |
| `setSize(size, persist?)` | `FontSize, boolean` | Change font size (persist defaults to true) |
| `getSize()` | - | Returns current font size |
| `increase()` | - | Increase to next larger size |
| `decrease()` | - | Decrease to next smaller size |

### Types

```typescript
type FontSize = 'small' | 'normal' | 'large' | 'x-large';

interface SuFontSizeConfig {
  storageKey?: string;           // Default: 'su:fontSize'
  cssVarPrefix?: string;         // Default: '--su-font-size-'
  defaultSize?: FontSize;        // Default: 'normal'
  sizes?: {
    [key in FontSize]?: string;  // Custom pixel/rem values
  };
}
```

## Configuration Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `storageKey` | The key used to persist font size in `localStorage` | `'su:fontSize'` |
| `cssVarPrefix` | Prefix for CSS variables | `'--su-font-size-'` |
| `defaultSize` | Default font size if none saved | `'normal'` |
| `sizes` | Custom size values (px, rem, em) | `{ small: '14px', normal: '16px', large: '18px', 'x-large': '20px' }` |

## Accessibility

This library helps meet WCAG 2.1 guidelines:

- ✅ **Success Criterion 1.4.4** - Text can be resized up to 200% without loss of content or functionality
- ✅ **Success Criterion 1.4.8** - User can select foreground and background colors (when combined with theme management)
- ✅ **Success Criterion 1.4.12** - Text spacing is adjustable

### Best Practices

1. **Use relative units** - Consider using `rem` instead of `px` for better scaling
2. **Test at all sizes** - Ensure your layout works at all font size settings
3. **Provide clear controls** - Make font size controls easy to find and use
4. **Persist preference** - Always save user preference (enabled by default)
5. **Respect system settings** - Consider reading system font size preferences

## 🌐 Browser Compatibility

Works in all modern browsers that support:
- ✅ CSS Custom Properties
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

- 👀 [@su-labs/visit-tracker](https://www.npmjs.com/package/@su-labs/visit-tracker) - User visit tracking
- 🎨 [@su-labs/theme](https://www.npmjs.com/package/@su-labs/theme) - Theme management with dark mode support
- 🔔 [@su-labs/notifications](https://www.npmjs.com/package/@su-labs/notifications) - Toast notification system
- 🔍 [@su-labs/scroll-spy](https://www.npmjs.com/package/@su-labs/scroll-spy) - Scroll position tracking

## 🔧 Troubleshooting

### Font size not persisting?

Make sure localStorage is enabled and not blocked by privacy settings.

### CSS variables not updating?

Ensure you're using the correct prefix in your CSS (`--su-font-size-` by default) and that you've initialized the service.

### Layout breaking at larger sizes?

Test your responsive design at all font sizes. Use relative units and flexible layouts.

### TypeScript errors?

Ensure you have Angular 21+ and TypeScript 5.7+ installed.

## 💬 Support

- 🐛 Found a bug? [Open an issue](https://github.com/Greezaaa/settings-utils-lib/issues)
- 💡 Have a feature request? [Start a discussion](https://github.com/Greezaaa/settings-utils-lib/discussions)
- ⭐ Like this library? [Give it a star!](https://github.com/Greezaaa/settings-utils-lib)

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/font-size/LICENSE) file for details.