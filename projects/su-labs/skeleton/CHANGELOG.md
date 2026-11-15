# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.0.0] - 2026-11-15

### Added
- `su-lib-skeleton`: draws the elements inside it as placeholders laid out with your own HTML and CSS, with one shimmer across every shape, hidden from screen readers; the shimmer stops when less motion is asked for
- The `su-skeleton-layout` class for wrappers that only lay shapes out
- `[suSkeletonBusy]` on the loading region: `aria-busy` while loading and `aria-live="polite"`
- `--su-skeleton-color`, `--su-skeleton-shimmer`, `--su-skeleton-radius`, `--su-skeleton-duration` and `--su-skeleton-angle`
