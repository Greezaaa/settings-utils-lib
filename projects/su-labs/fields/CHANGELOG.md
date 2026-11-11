# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [22.0.0] - 2026-11-11

### Added
- `SuCodeBoxesComponent` (`su-lib-code-boxes`): a short code typed into boxes that fill one by one and turn green in a wave once complete; one real text field underneath, so pasting, phone keyboards and screen readers work
- `SuStrengthMeterComponent` (`su-lib-strength-meter`): four bars under a new password that fill and change colour as it gets stronger, with its word per step; a `meter` for screen readers
- `suPasswordStrength()` and `suStrengthLevel()`: the meter's rule, usable on its own
- `SuAutoGrowDirective` (`textarea[suAutoGrow]`): a text box that grows a line at a time with a soft spring, and shrinks back when emptied
- `--su-field-*` CSS variables for colours, and no motion for visitors who ask their device for less
