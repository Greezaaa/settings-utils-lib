# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-08-30

### Fixed
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.

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
