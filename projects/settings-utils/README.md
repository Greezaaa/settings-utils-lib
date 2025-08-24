
<div align="center">
  <img width="200" height="200" alt="settings-utils-logo" src="https://github.com/user-attachments/assets/e9da63c8-960d-4e06-a0ce-2cf84fff1311" />

# Settings Utils
</div>

A collection of lightweight, reusable Angular utilities for building modern, reactive web applications. <br />
Each utility is fully modular and can be used independently or together.
<br /><br />
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

### SuNotificationService & Component
 Easily display and manage notifications in your Angular applications.
- SuNotificationService allows you to show, dismiss, and configure notifications programmatically.
- SuNotificationComponent renders notifications in the UI and automatically reacts to the service.
- Supports:
	- Icons: default, boolean toggle, inline SVG, or image path.
	- Configurable position: top-left, top-right, bottom-left, bottom-right etc.
	- Auto-dismiss after a configurable duration.
	- Manual dismissal via close button.
- Fully reactive with Angular Signals, making it easy to integrate with components.
- Handles multiple notifications simultaneously.

[Notifications README](./src/lib/notification/README.md)

---

### License
MIT [License](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/LICENSE)


© 2025 Yevheniy Alekseyev - yev.alekseyev@gmail.com
