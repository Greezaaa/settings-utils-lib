# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [1.0.1] - 2025-08-27

### Changed
- Updated documentation (`README.md`) to reflect new scoped package import:
  from `./path/to/su-theme.service` → `@su-labs/theme`.



##	[1.0.0] - 2024-08-26
###	Added
-	Initial public release of the **@su-labs/theme** library.

-	Introduction of **SuThemeService**, a robust and reactive service for managing application themes.

-	Reactive state management with Angular `Signals`.

-	Seamless integration with system theme preference via `prefers-color-scheme`.

-	Automatic persistence of user theme preference in `localStorage`.

-	Highly configurable service with customizable storage keys, CSS variable prefixes, and theme variable overrides.

-	Public API for programmatic control, including `setTheme()` and `getTheme()`.

-	Support for default themes: `light`, `dark`, `contrast`, `custom`, and `system`.







