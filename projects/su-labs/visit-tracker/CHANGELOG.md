# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.1.7] - 2026-11-20

### Changed
- Uses `@su-labs/core` 1.14.0 (was 1.13.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.6] - 2026-11-18

### Changed
- Uses `@su-labs/core` 1.13.0 (was 1.12.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.5] - 2026-11-18

### Changed
- Uses `@su-labs/core` 1.12.0 (was 1.11.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.4] - 2026-11-17

### Changed
- Uses `@su-labs/core` 1.11.0 (was 1.10.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.3] - 2026-11-17

### Changed
- Uses `@su-labs/core` 1.10.0 (was 1.9.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.2] - 2026-11-16

### Changed
- Uses `@su-labs/core` 1.9.0 (was 1.8.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.1.1] - 2026-11-14

### Changed
- Package homepage now points to the website with a live demo
- Pins `@su-labs/core` to exactly 1.8.0

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