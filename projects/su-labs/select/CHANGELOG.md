# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.1.0] - 2026-11-20

### Changed

- The list bounces open (`--su-select-duration` now `380ms`) and fades out when it closes (`--su-select-close-duration`), unless the user prefers less motion

## [22.0.0] - 2026-11-18

### Added

- `su-lib-select`: a select with its own styled trigger and list instead of the browser's popup, `[options]` of `{ value, label, disabled?, group? }` and `[(value)]` of any type
- `searchable`: a search field at the top of the list that filters the options, ignoring case and accents
- Groups listed under their heading (`role="group"`), and disabled options that are shown but can't be chosen
- The WAI-ARIA select-only combobox pattern: `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-activedescendant`; arrows, Home, End, Page Up and Page Down, type-ahead (choosing at once while closed), Enter, Space or Alt + ↑ to choose, Escape to close and Tab to choose and move on
- The list opens in the top layer (`popover`), below the trigger or above it when there's no room, follows the trigger while the page scrolls and closes once it's out of view, and fades in unless the user prefers less motion (`animated`)
- `(chosen)`: the value the user chose, typed without `null`, not emitted for a value set from outside
- `[(open)]`, `[(touched)]`, `disabled`, `placeholder`, `ariaLabel`, `ariaLabelledby`, `focus()`
- `labels` to replace the texts (`SU_SELECT_LABELS`), and `--su-select-*` CSS variables for the look
