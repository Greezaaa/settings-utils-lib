# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [22.0.0] - 2026-11-09

### Added
- `SuDialogService` (`confirm`, `alert`, `open`, `configure`, `current` as a signal) and the `<su-lib-dialog />` component, on the native `<dialog>`: focus stays inside, Escape and a click outside cancel when `dismissible`
- One button (`ok`) or accept and cancel (`confirm`), with your own labels; `danger` styles the accept button and starts focus on Cancel
- HTML body (sanitized by Angular), an optional picture, width and height
- A dimmed or clear backdrop, with its colour and opacity
- Every part themeable with `--su-dialog-*` CSS variables, and `cssClass` for one dialog
- Depends on exactly `@su-labs/core` 1.4.0 (version 22 follows Angular 22)
