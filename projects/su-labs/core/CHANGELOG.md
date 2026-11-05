# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-05

First stable release. Every @su-labs utility is now available without Angular.

### Added
- `createSuStore`: minimal reactive store compatible with the Svelte store contract and React `useSyncExternalStore`
- `isBrowser`: environment check used to keep utilities safe in Node and during SSR
- `@su-labs/core/theme`: framework-agnostic `SuThemeController` (moved from `@su-labs/theme`)
- `@su-labs/core/font-size`: framework-agnostic `SuFontSizeController` (moved from `@su-labs/font-size`)
- `@su-labs/core/notifications`: framework-agnostic `SuNotificationController` and `isSuNotificationImageIcon` (moved from `@su-labs/notifications`)
- `@su-labs/core/scroll-spy`: framework-agnostic `SuScrollSpyController` and `observeSuScrollSpySection` (moved from `@su-labs/scroll-spy`)
- `@su-labs/core/visit-tracker`: framework-agnostic `SuVisitTrackerController` (moved from `@su-labs/visit-tracker`)
