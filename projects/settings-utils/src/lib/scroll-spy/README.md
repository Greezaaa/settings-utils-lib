# ScrollSpy

A lightweight Angular service and directive for managing active sections based on scroll position. Easily track which section of a page is currently visible and update your UI accordingly. Perfect for navigation menus, table of contents, or one-page scroll applications.

### Features

- Track the currently visible section on the page.
- Reactive `Signals` for seamless integration with Angular.
- Works with multiple sections.
- Optional directive to automatically update the active section using IntersectionObserver.
- Fully modular: use the service alone, or combine with the directive for automatic detection.

### ScrollSpyService Usage
### Provide the service

```typescript
export const appConfig: ApplicationConfig = {
  providers: [ScrollSpyService]
};
```

### Use the service in a component
```typescript
import { Component, effect, computed, inject } from '@angular/core';
import { ScrollSpyService } from 'settings-utils';

@Component({
  selector: 'app-scroll-example',
  template: `
    <div *ngFor="let section of sections" [id]="section">{{ section }}</div>
    <p>Active section: {{ activeSection() }}</p>
  `
})
export class ScrollExampleComponent {
  private spy = inject(ScrollSpyService);
  activeSection = computed(() => this.spy.activeSection());

  sections = ['home', 'about', 'services', 'contact'];

  constructor() {
    effect(() => {
      console.log('Current active section:', this.activeSection());
    });
  }
}
```

### ScrollSpyDirective Usage
### Attach the directive to sections
```typescript
<section id="home" appScrollSpy="home">Home</section>
<section id="about" appScrollSpy="about">About</section>
<section id="services" appScrollSpy="services">Services</section>
<section id="contact" appScrollSpy="contact">Contact</section>
```

### Options

- `appScrollSpy` – optional input to specify a custom section ID (defaults to the element `id`).
- Works automatically with `ScrollSpyService` to update the active section signal.

### Notes

You can use the service standalone if you prefer to update the active section manually.

The directive relies on IntersectionObserver, supported in modern browsers.

Combining the service and directive gives a fully reactive, automatic scroll spy solution.