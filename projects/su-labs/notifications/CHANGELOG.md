# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [22.2.0] - 2026-11-07

### Added
- Notifications slide in from their side of the screen and slide out when closed; durations set with `--su-notification-enter-duration` (400ms) and `--su-notification-leave-duration` (300ms), and no motion for visitors who prefer reduced motion
- `slideFrom` option (`'auto'`, `'left'`, `'right'`, `'top'`, `'bottom'`) to slide in from a chosen direction whatever the position, as `configure({ slideFrom })` or the `slideFrom` property
- `actions` option: buttons under the message (`label`, `onClick`, `dismiss`), each closing the notification unless `dismiss: false`

### Changed
- Depends on exactly `@su-labs/core` 1.2.0 (no version range), so every install runs the core it was tested with

### Documentation
- README lists every CSS variable, including `--su-notification-max-width` for wider notifications

## [22.1.1] - 2026-11-05

### Changed
- Package homepage now points to the website with a live demo

### Fixed
- Notifications without `cssClass` rendered empty under Angular 22 (`NgClass` no longer accepts `undefined`); classes are now bound directly and `CommonModule` is no longer imported

## [22.1.0] - 2026-11-05

### Changed
- Notification logic moved to the framework-agnostic `@su-labs/core/notifications`; `SuNotificationService` is now an Angular wrapper around `SuNotificationController` with the same public API
- Added `@su-labs/core` as a dependency
- README links to the `@su-labs/core` installation guides for non-Angular projects

### Fixed
- Auto-close timers are cancelled when a notification is dismissed or the service is destroyed
- Repair table of contents links in README.md
