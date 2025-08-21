
# Settings Utils
A collection of lightweight, reusable Angular utilities for building modern, reactive web applications. Each utility is fully modular and can be used independently or together.

### Angular Utility Libraries Workspace
This workspace centralizes reusable Angular services and utilities that can be shared across multiple projects.

### Purpose
- Many Angular projects need small utilities like font management, theming, or other global logic. This workspace allows:
- Centralized, reusable services
- Modular architecture with independent versioning
- Easy installation via `npm install settings-utils`
- Consistent utilities across projects

## Utilities
### FontSizeService

Dynamic font size management for Angular applications.

- Easily increase, decrease, or reset font sizes.
- Persistent user preferences via localStorage.
- Fully reactive with Angular Signals.
- Configurable minimum, maximum, default sizes, step, and CSS variable.

[FontSize README](./src/lib/font-size/README.md)

### ScrollSpyService & Directive

Track which section of a page is currently visible and react to scroll events.

- Service provides reactive access to the active section.
- Directive automatically updates the active section when elements enter the viewport.
- Ideal for navigation menus, table of contents, or one-page scroll apps.
- Fully modular: use the service alone or combine with the directive for automatic detection.

[ScrollSpy README](./src/lib/scroll-spy/README.md)
<hr>


### License
MIT [License](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/LICENSE)


© 2025 Yevheniy Alekseyev - yev.alekseyev@gmail.com