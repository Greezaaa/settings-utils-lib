# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `SU_THEME_PALETTES` in `@su-labs/core/theme`: three ready-made dark palettes (`sunset`, `candy`, `copper`, listed in `SU_PALETTE_NAMES`), checked for readable text and accent contrast

## [1.5.0] - 2026-11-09

### Added
- `size` option for dialogs (`SuDialogSize`: `'small'`, `'medium'`, `'large'`, default `'small'`): how tall a dialog is at least, growing with its content

## [1.4.0] - 2026-11-09

### Added
- `@su-labs/core/dialog`: `SuDialogController` for confirm and message dialogs, one at a time, each answered with a promise (`confirm`, `alert`, `open`, `close`, `configure`), with HTML text, an optional picture, button labels, size, a dimmed or clear backdrop (`backdrop`, `backdropColor`, `backdropOpacity`), `dismissible` and `danger`

## [1.3.0] - 2026-11-07

### Added
- A notification `message` can be a list of pieces (`SuNotificationMessagePart`): text and links (`label`, `onClick`, `dismiss`), so part of the message itself opens something

## [1.2.0] - 2026-11-07

### Added
- `actions` option for `SuNotificationController` notifications (`SuNotificationAction`: `label`, `onClick`, `dismiss`), kept on each notification for your markup to render
- `slideFrom` option and store for `SuNotificationController` (`'auto'` by default): the direction notifications slide in from

## [1.1.0] - 2026-11-07

### Added
- `SuStorage`: the storage interface the utilities save to (`getItem`, `setItem`, `removeItem`); `localStorage` fits as is
- `createSuCookieStorage({ domain, maxAgeDays })`: saves values in cookies so sites on the same parent domain share them; the domain is only used when the page is on it, so `localhost` keeps working
- `getSuLocalStorage()`: `localStorage` in a browser, `null` elsewhere
- `storage` option for `SuThemeController` and `SuFontSizeController` (default: `localStorage`)
- `target` option for `SuThemeController`: the element the theme is applied to (default: `<html>`), to theme one part of a page

### Changed
- Package homepage now points to the website with a live demo

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
