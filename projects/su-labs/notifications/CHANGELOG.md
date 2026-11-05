# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
