# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.0.1] - 2026-11-18

### Changed
- Uses `@su-labs/core` 1.13.0 (was 1.12.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.0.0] - 2026-11-18

### Added

- `su-lib-tooltip`: its content is the trigger and `text` (a string or an `<ng-template>`) is what the tooltip shows
- `openOn`: `hover` (and keyboard focus), closing once the pointer or focus leaves, or `click`, staying open until clicked again, a click outside or Escape
- `interactive`: the pointer can move onto a hover tooltip, over an invisible bridge across the gap, e.g. to click a link; otherwise the pointer goes through it so it never covers what the user moves to
- `trigger="icon"`: a "?" button after the content; the tooltip grows out of the icon to `width`, as tall as its text, and the "?" turns into its close button; `icon` replaces the "?" with a short text or an `<ng-template>`
- `placement`: `top`, `right`, `bottom` or `left`, each with `-start` and `-end`; it moves to the other side when the asked one has no room and stays inside the screen, with an arrow pointing at the trigger (`arrow`, `offset`)
- `animated`: grows out of the trigger and back into it, off when the user prefers less motion
- `showDelay`, `hideDelay`, `disabled`, `[(open)]`, and `show()`, `hide()`, `toggle()`
- A hover tooltip is `role="tooltip"` and describes its trigger with `aria-describedby`; a click or icon tooltip's button has `aria-expanded` and `aria-controls`; plain text content becomes focusable; Escape closes it and focus goes back to the trigger
- The top layer (`popover`), so no `overflow: hidden` or `z-index` around it cuts it off
- `label` and `labels` to replace the texts (`SU_TOOLTIP_LABELS`), and `--su-tooltip-*` CSS variables for the look
