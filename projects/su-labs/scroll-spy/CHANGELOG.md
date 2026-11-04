# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [1.0.2] - 2025-08-30

### Fixed
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.


## [1.0.1] - 2025-08-30

### Note
- This version was published with incorrect package content and is deprecated. Please use `1.0.4`.

##	[1.0.0] - 2024-08-26

###	Added

- Initial public release of the @su-labs/scroll-spy library.

- Introduction of ScrollSpyService, a reactive service that uses an Angular Signal to track the currently visible section.

- Introduction of ScrollSpyDirective, a standalone directive that uses the browser's native IntersectionObserver to automatically update the ScrollSpyService when a section enters the viewport.

- Configurable rootMargin to allow precise control over when the scroll-spy effect is triggered.

- Full support for modern Angular applications using @for, @if, and inject().
