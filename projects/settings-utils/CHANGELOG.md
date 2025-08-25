# Changelog

##	[1.5.1] - 2025-08-25
###	Added

- Exported `SuVisitTrackerService` in the public API so it’s available for external projects.

###	Notes

- This fixes an oversight where the service was implemented but not publicly accessible via the package entry points.

## [1.5.0] - 2025-08-25
### Added

- `SuVisitTrackerService` to track user visits with reactive signals.

	- Signals for visit count (`count`), last visit date (`lastVisit`), and milestones (`isTenthVisit`, `isHundredthVisit`).

	- Milestones are configurable via `milestoneVisits`.

	- `LocalStorage` persistence for visit count and last visit timestamp.

	- Standalone and reactive-friendly design for Angular components.

### Changed

- SuThemeService: removed `APP_INITIALIZER` example from README and replaced with `provideAppInitializer()` modern usage.

- `FontSizeService`: storageKey renamed from `'app:font-size'` → `'su:font-size'` for consistency with other services.

- `SuVisitTrackerService`: storageKey renamed from `'su-visits'` to `'su:visits'` to follow new storage key naming convention.

###	Notes

- `SuVisitTrackerService` automatically initializes itself when injected; no manual initialization required unless custom configuration is needed.

- Changelog reflects modern Angular best practices using provideAppInitializer instead of deprecated `APP_INITIALIZER` syntax.

## [1.4.0] - 2025-08-25
### Added
- `SuThemeService` for robust, reactive, and configurable theme management.

- Support for multiple themes: `light`, `dark`, `contrast`, `custom`, and `system`.

- Reactive state management using Angular signals (`theme` signal).

- Automatic detection and switching based on user's system theme preference (`prefers-color-scheme`).

- Theme preference persistence using `localStorage`.

- Configuration via `SuThemeConfig` interface and the `init()` method, designed for use with `APP_INITIALIZER`.

### Notes
- This service handles all theme logic internally, including loading, persistence, and CSS variable application, providing a clean public API.

## [1.3.0] - 2025-08-25
### Changed

- Refactored CSS variable names for improved clarity, consistency, and to prevent naming collisions.

- The previous generic --su- prefix has been replaced with a more specific --su-notification- prefix, followed by the component part and property.

### CSS Variable Renames:

- `--su-gap` → `--su-notification-container-gap`

- `--su-notification-position` → `--su-notification-container-position`

- `--su-background` → `--su-notification-background-color`

- `--su-color` → `--su-notification-text-color`

- `--su--padding-block` → `--su-notification-padding-block`

- `--su--padding-inline` → `--su-notification-padding-inline`

- `--su-shadow` → `--su-notification-box-shadow`

- `--su-border-radius` → `--su-notification-border-radius`

- `--su-success` → `--su-notification-success-border-color`

- `--su-info` → `--su-notification-info-border-color`

- `--su-warning` → `--su-notification-warning-border-color`

- `--su-error` → `--su-notification-error-border-color`

- `--su-custom` → `--su-notification-custom-border-color`

- `--su-icon-width` → `--su-notification-icon-width`

- `--su-icon-height` → `--su-notification-icon-height`

- `--su-icon-color` → `--su-notification-icon-color`

- `--su-btn-size` → `--su-notification-close-btn-size`

- `--close-btn-font-size` → `--su-notification-close-btn-font-size`

- `--su-border-color` → `--su-notification-close-btn-border-color`

- `--su-hover-background` → `--su-notification-close-btn-hover-background`

- `--su-hover-color` → `--su-notification-close-btn-hover-color`

### Added

- New optional CSS variables for more granular control of the close button:

	- `--su-notification-close-btn-background-color`

	- `--su-notification-close-btn-text-color`

	- `--su-notification-close-btn-border-radius`

### Notes

⚠️ This is a breaking change for anyone who customized the component’s appearance. You must update your stylesheets to use the new variable names.

## [1.2.0] - 2025-08-24
### Added

- `SuNotificationService` to dynamically show, dismiss, and configure notifications.
- `SuNotificationComponent` to render notifications in the UI, automatically reacting to the service.
- Support for icons:
	 - Boolean: show default icon or hide icon.
	 - Inline SVG string or image path for custom icons.
- Auto-dismiss notifications after configurable duration.
- Manual dismissal via close button.
- Configurable position (`top-left`, `top-right`, `top-center`, `bottom-left`, `bottom-right`, `bottom-center`).
- Reactive notifications stream for Angular components.
- `configure()` method for default duration, position, and icon display settings.
- Full documentation in README.md for usage, options, and integration.

### Notes

- Notifications can be shown from any component or service by injecting `SuNotificationService`.
- Supports multiple notifications at once.
- Fully standalone component compatible with Angular reactive system.

## [1.1.0] - 2025-08-21
### Added
- `ScrollSpyService` to track currently visible sections on the page.
- `ScrollSpyDirective` to automatically update active section when elements intersect the viewport.
- Reactive `Signal` for the active section to integrate with Angular components.
- Examples for using ScrollSpy with multiple sections and custom section IDs.
- Full documentation in `README.md` for ScrollSpy usage and configuration.

### Notes
- ScrollSpy can be used standalone via service or combined with the directive for automatic detection.
- Supports multiple sections and modern browser IntersectionObserver.

## [1.0.1] - 2025-08-18
### Added
- Full reactive `FontSizeService` with `signal` and `computed` for `fontSize`, `isDefault`, `isMax`, `isMin`.
- Methods to `increase`, `decrease`, `reset`, and `setFontSize`.
- `configure()` method to customize `minSize`, `maxSize`, `defaultSize`, `step`, storage key, and CSS variable.
- Automatic localStorage persistence of font size.
- CSS variable application for dynamic font size.

### Fixed
- Proper clamping of font size within min/max.
- LocalStorage handling for invalid or missing values.
- Step validation (defaults to 1 if invalid).
- Deprecated old incorrect versions internally (previous published versions had errors).

## [0.0.3] - 2025-08-18
### Changed
- Convert FontSizeService properties and methods to instance members

## [0.0.2] - 2025-08-18
### Changed
- MIT license added

## [0.0.1] - 2025-08-18
### Added
- FontSizeService published
- Added max/min font size checks
- Added `isDefault` signal
