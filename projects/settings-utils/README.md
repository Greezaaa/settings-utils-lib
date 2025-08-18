# FontSizeService

A lightweight Angular service for dynamic font size management. Easily increase, decrease, or reset font sizes in your Angular applications, with persistent settings in `localStorage`. Designed as a reusable library for multiple projects.

## Features

- Set a default font size and apply it globally.
- Increase or decrease font size with configurable step.
- Reset to default font size.
- Automatically persist user preferences in `localStorage`.
- Provides reactive `Signal`s to integrate with Angular's reactive system.
- Limits font size to configurable minimum and maximum values.

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

Optional configuration

You can customize min/max/default font size, step, storage key, and CSS variable:

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

`minSize` / `maxSize` / `defaultSize` / `step` – control font scaling.

`storageKey` – key used in localStorage to persist font size.

`cssVarName` – CSS custom property applied globally, e.g., `document.documentElement.style.setProperty(cssVarName, ...)`.

This setup ensures that your font size is reactive, persistent, and easily configurable across your Angular app.