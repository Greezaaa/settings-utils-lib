# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [22.1.0] - 2026-11-09

### Added
- `size`: `'small'`, `'medium'` or `'large'` (at least 20%, 50% or 80% of the screen's height, growing with the content; default `'small'`), each adjustable with `--su-dialog-small-height`, `--su-dialog-medium-height` and `--su-dialog-large-height`
- `--su-dialog-danger-border`

### Changed
- The danger button is a soft red (a light tint with red text and border) instead of solid red
- The buttons sit at the bottom of a tall dialog

### Fixed
- A page's CSS reset (`margin: 0`) no longer stretches the dialog to the full height of the screen
- Focus opens on a button, never on the dialog itself (no focus ring around the whole dialog)
- Depends on exactly `@su-labs/core` 1.5.0

## [22.0.0] - 2026-11-09

### Added
- `SuDialogService` (`confirm`, `alert`, `open`, `configure`, `current` as a signal) and the `<su-lib-dialog />` component, on the native `<dialog>`: focus stays inside, Escape and a click outside cancel when `dismissible`
- One button (`ok`) or accept and cancel (`confirm`), with your own labels; `danger` styles the accept button and starts focus on Cancel
- HTML body (sanitized by Angular), an optional picture, width and height
- A dimmed or clear backdrop, with its colour and opacity
- Every part themeable with `--su-dialog-*` CSS variables, and `cssClass` for one dialog
- Depends on exactly `@su-labs/core` 1.4.0 (version 22 follows Angular 22)
