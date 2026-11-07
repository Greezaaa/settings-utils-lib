# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [22.2.0] - 2026-11-07

### Added
- `target` option: the element the theme is applied to (default: `<html>`), to theme one component instead of the whole page
- `storage` option: where the selected theme is saved (default: `localStorage`); pass `createSuCookieStorage({ domain })` from `@su-labs/core` to share it across subdomains

### Changed
- Requires `@su-labs/core` 1.1.0 or later
- Package homepage now points to the website with a live demo

## [22.1.0] - 2026-11-05

### Changed
- Theme logic moved to the framework-agnostic `@su-labs/core/theme`; `SuThemeService` is now an Angular wrapper around `SuThemeController` with the same public API
- Added `@su-labs/core` as a dependency

## [22.0.0] - 2026-11-04

### Changed
- Upgrade to Angular 22 (peer dependencies now `^22.0.0`)
- Remove emojis from README.md

## [21.0.5] - 2026-02-04

### Changed
- Update README.md

## [21.0.4] - 2026-02-03

### Changed
- **BREAKING:** Updated to Angular 21 support. This version requires Angular 21.0.0 or higher.
- Updated peer dependencies to `@angular/common: ^21.0.0` and `@angular/core: ^21.0.0`.
- Aligned package version with Angular major version for clearer compatibility (v21.x.x = Angular 21 support).

### Notes
- Projects using Angular 20 or below should continue using version 1.0.3.
- This release maintains full backward compatibility with the 1.x API - only the Angular version requirement has changed.


## [1.0.3] - 2025-08-30

### Fixed
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.
- Removed unintended `.spec.ts` exports from the public API surface.

## [1.0.2] - 2025-08-30

### Note
- This version was published with incorrect package content and is deprecated. Please use `1.0.4`.

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







