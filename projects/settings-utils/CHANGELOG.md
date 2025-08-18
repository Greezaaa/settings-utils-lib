# Changelog

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
