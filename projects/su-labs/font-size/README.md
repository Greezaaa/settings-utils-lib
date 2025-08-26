# FontSizeService

A lightweight Angular service for dynamic font size management. Easily increase, decrease, or reset font sizes in your Angular applications, with persistent settings in `localStorage`. Designed as a reusable library for multiple projects.

## Features

- Set a default font size and apply it globally.
- Increase or decrease font size with configurable step.
- Reset to default font size.
- Automatically persist user preferences in `localStorage`.
- Provides reactive `Signal`s to integrate with Angular's reactive system.
- Limits font size to configurable minimum and maximum values.

## Installation

You can install this library via npm:

```bash
npm install @su-labs/font-size
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^20.1.0 @angular/core@^20.1.0
```

## Usage
### Provide the service in your application

You can provide the service in your main.ts (or wherever your ApplicationConfig is defined) and initialize it automatically:

```typescript
export const appConfig: ApplicationConfig = {
providers: [
	FontSizeService,
	provideAppInitializer(() => {
	
	const fontService = inject(FontSizeService);
	fontService.init(); // initializes font size from localStorage and applies CSS variable
	}),
	],
};
```
Using the service in components

Inject the service into any component and access reactive signals:

```typescript
import { Component, effect } from '@angular/core';
import { FontSizeService } from 'settings-utils';

@Component({
selector: 'app-example',
template: `
	<div> 
		<p>Current font size: {{ fontSize() }}</p> 
		<button (click)="increase()">A+</button> 
		<button (click)="decrease()">A-</button> 
		<button (click)="reset()">Reset</button> 
	</div>` ,
})

export class ExampleComponent {
	private fontService = inject(FontSizeService);
	fontSize = computed(() => this.fontService.fontSize());

	increase(step?: number) {
		this.fontService.increase(step);
	}

	decrease(step?: number) {
		this.fontService.decrease(step);
	}

	reset() {
		this.fontService.reset();
	}
}
```

### Optional configuration

The service can be configured to fit your application's needs. You can customize the min/max/default font size, step, storage key, and CSS variable name by calling the `configure` method.

| Option       | Description                                                                                             | Default Value   |
|--------------|---------------------------------------------------------------------------------------------------------|-----------------|
| `minSize`    | The minimum allowed font size in pixels.                                                                | `10`            |
| `maxSize`    | The maximum allowed font size in pixels.                                                                | `22`            |
| `defaultSize`| The initial font size and the value used for resetting.                                                 | `14`            |
| `step`       | The number of pixels to increase or decrease the font size by.                                          | `2`             |
| `storageKey` | The key used to persist the font size in `localStorage`.                                                | `'su:font-size'`|
| `cssVarName` | The name of the CSS custom property that will be applied to the `<html>` element.                       | `'--base-font-size'`|

**Example:**

```typescript
this.fontService.configure({
  minSize: 12,
  maxSize: 24,
  defaultSize: 16,
  step: 2,
  storageKey: 'my-app-font-size',
  cssVarName: '--app-font-size'
});
```

## Styling (CSS)

The service applies the current font size to a CSS custom property (variable) on the `<html>` element. By default, this is `--base-font-size`.

To use this feature in your application's CSS, you should use this variable to define your font size, for example, in your `styles.scss` or `styles.css`:

```css
:root {
  /* Define a fallback in case the service isn't initialized yet */
  --base-font-size: 14px;
}

body {
  font-size: var(--base-font-size);
}
```

Or, if you configured a different name:

CSS
```css
body {
  font-size: var(--app-font-size);
}
```

This setup ensures that your font size is reactive, persistent, and easily configurable across your Angular app.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our GitHub repository.

To contribute code, please ensure your changes include unit tests using **Vitest** to maintain code quality.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/font-size/LICENSE) file for details.