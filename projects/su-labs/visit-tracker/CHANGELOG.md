# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2025-08-30

### Fixed
- Removed unintended `.spec.ts` exports from the public API surface.
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.


## [1.0.1] - 2025-08-27

### Changed
- Updated documentation (`README.md`) to reflect new scoped package import:
  from `./su-visit-tracker.service` → `@su-labs/visit-tracker`.


## [1.0.0] - 2024-08-26

### Added

- Initial public release of the @su-labs/visit-tracker library.
- Introduction of SuVisitTrackerService, a lightweight service for tracking user visits.
- Reactive `Signal`s for `count`, `lastVisit`, `isTenthVisit`, and `isHundredthVisit`.
- Persistent storage of visit data in `localStorage`.
- Support for custom milestone visits via `milestoneVisits` configuration.
- Full support for modern Angular applications using `inject()` and `provideAppInitializer`.