# ScrollSpy

A lightweight Angular service and directive for managing active sections based on scroll position. Easily track which section of a page is currently visible and update your UI accordingly. Perfect for navigation menus, table of contents, or one-page scroll applications.

## Features

- Track the currently visible section on the page
- Reactive Signals for seamless integration with Angular
- Works with multiple sections
- Optional directive to automatically update the active section using IntersectionObserver
- Fully modular: use the service alone, or combine with the directive for automatic detection

## Installation

You can install this library via npm:

```sh
npm install @su-labs/scroll-spy
```

## Peer Dependencies

This library requires the following peer dependencies:

```sh
npm install @angular/common@^20.1.0 @angular/core@^20.1.0
```

## Usage

### Using the service and directive

The most common usage is to combine the `ScrollSpyService` with the `ScrollSpyDirective` to create an automatic, reactive scroll-spy solution.

#### Attach the directive to your sections

In your component template, apply the `appScrollSpy` directive to each section you want to track. The input value should be a unique ID for that section. It's a good practice to also set the `id` attribute for anchor links.

```html
@for (section of sections; track section.id) {
  <a
    [href]="'#' + section.id"
    [class.active]="activeSection() === section.id"
  >
    {{ section.name }}
  </a>
}

@for (section of sections; track section.id) {
  <section [id]="section.id" [appScrollSpy]="section.id">
    <h2>{{ section.name }}</h2>
    <p>Content for the {{ section.name }} section...</p>
  </section>
}
```

#### Inject the service into your component

Because the `ScrollSpyService` is provided at the root level, you can simply inject it into any component. Directly assign the `activeSection` signal to a property to use it in your template.

```ts
import { Component, inject, signal } from '@angular/core';
import { ScrollSpyService, ScrollSpyDirective } from '@su-labs/scroll-spy';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-scroll-example',
  templateUrl: './scroll-example.component.html',
  standalone: true,
  imports: [ScrollSpyDirective, NgClass]
})
export class ScrollExampleComponent {
  private readonly scrollSpyService = inject(ScrollSpyService);
  activeSection = this.scrollSpyService.activeSection;

  sections = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'services', name: 'Services' },
    { id: 'contact', name: 'Contact' }
  ];
}
```

## How It Works

The `ScrollSpyDirective` uses the browser's native [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to efficiently monitor when elements enter or exit the viewport. It's configured to trigger when a tracked section is roughly in the vertical center of the screen, providing a smooth and accurate "spy" effect.

## Contributing

If you find any bugs or have feature requests, please open an issue or submit a pull request on our [**GitHub repository**](https://github.com/Greezaaa/settings-utils-lib.git).

To contribute code, please ensure your changes include unit tests to maintain code quality. Please see the main repository's `README.md` for details on the monorepo structure.

## License

This project is licensed under the MIT License. See the [**LICENSE**](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/su-labs/scroll-spy/LICENSE) file for details.