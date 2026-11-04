# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Notification logic moved to the framework-agnostic `@su-labs/core/notifications`; `SuNotificationService` is now an Angular wrapper around `SuNotificationController` with the same public API
- Added `@su-labs/core` as a dependency

### Fixed
- Auto-close timers are cancelled when a notification is dismissed or the service is destroyed

## [22.0.1] - 2026-11-05

### Fixed
- Repair table of contents links in README.md
