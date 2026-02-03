# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [21.0.4] - 2026-02-03

### Changed
- **BREAKING:** Updated to Angular 21 support. This version requires Angular 21.0.0 or higher.
- Updated peer dependencies to `@angular/common: ^21.0.0` and `@angular/core: ^21.0.0`.
- Aligned package version with Angular major version for clearer compatibility (v21.x.x = Angular 21 support).

### Notes
- Projects using Angular 20 or below should continue using version 1.0.3.
- This release maintains full backward compatibility with the 1.x API - only the Angular version requirement has changed.


## [1.0.4] - 2025-08-30

### Fixed
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.

## [1.0.3] - 2025-08-30

### Note
- This version was published with incorrect package content and is deprecated. Please use `1.0.4`.

## [1.0.2] - 2025-08-26

### Changed
- Refactored project structure to a monorepo, separating `font-size` into its own distributable package.
- Updated documentation (`README.md`) with comprehensive installation, usage, and configuration guides.
- Improved `package.json` with standard fields: `keywords`, `author`, `license`, `repository`, `homepage`, and `bugs`.

## [0.0.1] - 2025-08-26
### Added
- Initial release of the `FontSizeService` library.
- `FontSizeService` with methods for increase, decrease, reset, and configure.
- `FontSizeConfig` interface for service configuration.
- Reactive `signals` (`fontSize`, `isDefault`, `isMax`, `isMin`).
- Persistence of font size in `localStorage`.
- Application of font size via CSS custom property.
- Unit tests with Vitest.
