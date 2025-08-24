
<div align="center">
  <img width="200" height="200" alt="settings-utils-logo" src="https://github.com/user-attachments/assets/e9da63c8-960d-4e06-a0ce-2cf84fff1311" />

# Settings Utils
</div>

## Table of Contents
- [Angular Utility Libraries Workspace](#angular-utility-libraries-workspace)
- [Purpose](#purpose)
- [ChangeLog](#changelog)
- [Utilities](#utilities)
- [License](#license)

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


[Back to Top](#table-of-contents)


## ChangeLog  
Stay up to date with all changes, fixes, and improvements in **Settings Utils**.  

The full changelog is available here:

[View Full Changelog](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/CHANGELOG.md)  

### Latest Release: [1.3.0] - 2025-08-25  
- Refactored and standardized **CSS variable names** in the Notification component.  
- Added new optional variables for better **close button customization**.  
- ⚠️ This update may require updating your stylesheets (see changelog for details). 

[Back to Top](#table-of-contents)

## Utilities
### FontSizeService

Dynamic font size management for Angular applications.

- Easily increase, decrease, or reset font sizes.
- Persistent user preferences via localStorage.
- Fully reactive with Angular Signals.
- Configurable minimum, maximum, default sizes, step, and CSS variable.

[FontSize README](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/src/lib/font-size/README.md)

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

[Notifications README](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/src/lib/notification/README.md)

### ScrollSpyService & Directive

Track which section of a page is currently visible and react to scroll events.

- Service provides reactive access to the active section.
- Directive automatically updates the active section when elements enter the viewport.
- Ideal for navigation menus, table of contents, or one-page scroll apps.
- Fully modular: use the service alone or combine with the directive for automatic detection.

[ScrollSpy README](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/src/lib/scroll-spy/README.MD)

[Back to Top](#table-of-contents)

---

### License
MIT [License](https://github.com/Greezaaa/settings-utils-lib/blob/main/projects/settings-utils/LICENSE)


© 2025 Yevheniy Alekseyev - yev.alekseyev@gmail.com
