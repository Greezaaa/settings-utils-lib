# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [22.1.0] - 2026-11-14

### Added
- `su-lib-email-field`: an email input that checks the address the way people mistype it, says what's wrong once the field is left, shows a tick when it looks right, and suggests a common domain for a likely typo (`gmial.com` → `gmail.com`) applied with one tap; `required`, your own `domains` and `messages`, `validityChange`. The check is exported as `suCheckEmail`
- `su-lib-checkbox`: a real checkbox whose tick draws itself in, with a squash when pressed and a dash when partly checked; `[(checked)]`, `indeterminate`, `disabled`
- `su-lib-chips`: toggle chips to pick several options or one (`multiple`), each popping a tick in when picked; typed `[(value)]`, disabled options
- `su-lib-switch`: a real checkbox (`role="switch"`) drawn as a sliding switch, with a stretching knob, a spring and a tick when on; `[(checked)]`, the label before or after it (`labelPosition`), `small` or `medium`, `disabled`, and `busy` (ignores clicks while saving, then shows the saved value); themed with `--su-switch-*` variables

## [22.0.0] - 2026-11-11

### Added
- `SuCodeBoxesComponent` (`su-lib-code-boxes`): a short code typed into boxes that fill one by one and turn green in a wave once complete; one real text field underneath, so pasting, phone keyboards and screen readers work
- `SuStrengthMeterComponent` (`su-lib-strength-meter`): four bars under a new password that fill and change colour as it gets stronger, with its word per step; a `meter` for screen readers
- `suPasswordStrength()` and `suStrengthLevel()`: the meter's rule, usable on its own
- `SuAutoGrowDirective` (`textarea[suAutoGrow]`): a text box that grows a line at a time with a soft spring, and shrinks back when emptied
- `--su-field-*` CSS variables for colours, and no motion for visitors who ask their device for less
