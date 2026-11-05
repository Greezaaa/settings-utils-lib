# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.1.0] - 2026-11-05

### Changed
- Visit tracking moved to the framework-agnostic `@su-labs/core/visit-tracker`; `SuVisitTrackerService` is now a thin wrapper with the same API
- `SuVisitTrackerConfig` and `SuVisitData` are now re-exported from `@su-labs/core/visit-tracker`
- Added `@su-labs/core` as a dependency
- README links to the `@su-labs/core` installation guides for non-Angular projects

### Fixed
- Corrupted or invalid saved data no longer throws; counting starts over
- `init()` no longer sorts the `milestoneVisits` array passed in the config
- Safe to call during server-side rendering (no `localStorage` access without a browser)
- README now documents the actual API (`milestone()` signal, `init()` required)
- Repair table of contents links in README.md

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
s

## [1.0.3] - 2025-08-30

### Fixed
- Removed unintended `.spec.ts` exports from the public API surface.
- Ensured `"license": "MIT"` is correctly reflected in the published package metadata.


## [1.0.2] - 2025-08-30

### Note
- This version was published with incorrect package content and is deprecated. Please use `1.0.4`.

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