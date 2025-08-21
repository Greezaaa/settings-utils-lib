# Changelog

## [1.0.2] - 2025-08-21
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
