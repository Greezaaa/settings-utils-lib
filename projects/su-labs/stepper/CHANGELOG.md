# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.0.1] - 2026-11-17

### Changed
- Uses `@su-labs/core` 1.11.0 (was 1.10.0), the same version as every other `@su-labs` package, so apps using several of them install core once

## [22.0.0] - 2026-11-17

### Added
- `su-lib-stepper` with `su-lib-step` pages shown one at a time: a numbered circle per step joined by a line, as many steps as you need, each with an optional `label`
- Rules per step: `canNext`, `canBack` and `disabled`; jumps check every step they pass, and the `linear` option keeps forward jumps to visited steps
- `orientation`: `'horizontal'` or `'vertical'`
- `tabs`: the step headers act as tabs (`tablist`, `tab`, `tabpanel`), still following the rules, with the arrow keys, Home and End; steps out of reach are announced as unavailable
- Back and Next buttons (`controls`), `[(current)]`, and `next()`, `back()`, `goTo()` and `reset()` for your own buttons; focus moves to the new step's content after Back or Next
- Without tabs, a list of steps with `aria-current="step"`; each step reads out its place, label and whether it's completed
- `labels` to replace the texts, and `--su-stepper-*` CSS variables
