# Fields

`@su-labs/fields`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Small animated form fields for Angular, built on plain inputs so forms, pasting, phone keyboards and screen readers keep working:

- **Code boxes**: a short code typed into boxes that fill one by one, then turn green in a wave once it's complete.
- **Strength meter**: four bars under a new password that fill and change colour as it gets stronger.
- **Auto grow**: a text box that grows a line at a time with a soft spring.

Every animation stops for visitors who ask their device for less motion.

## Installation

```bash
npm install @su-labs/fields
```

## Code boxes

```ts
import { SuCodeBoxesComponent } from '@su-labs/fields';

code = signal('');
isComplete = computed(() => /^[A-Z0-9]{6}$/.test(this.code()));
```

```html
<su-lib-code-boxes [(value)]="code" [length]="6" label="Room code" [complete]="isComplete()" />
```

| Input | Type | |
|---|---|---|
| `value` | `string` (two-way) | The code typed so far, in capitals without spaces |
| `length` | `number` | How many boxes |
| `label` | `string` | The field's name for screen readers |
| `complete` | `boolean` | The code is whole and valid: the boxes turn green |

## Strength meter

```html
<input #password type="password" autocomplete="new-password" />
<su-lib-strength-meter
  [field]="password"
  label="Password strength"
  [levelNames]="{ weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }"
  [minLength]="10"
/>
```

The meter follows the field's typing. If your code empties the field, send it an `input` event so the meter sees it.

The rule is exported too: `suPasswordStrength(password, minLength)` gives 0 to 4 bars, and `suStrengthLevel(bars)` its step
(`weak`, `fair`, `good`, `strong`).

## Auto grow

```html
<textarea suAutoGrow rows="2"></textarea>
<textarea [suAutoGrow]="isOn()" rows="2"></textarea>
```

It also shrinks back when its form is reset.

## Switch

A real checkbox (`role="switch"`) drawn as a sliding switch: the knob stretches while pressed, springs across, and a
tick pops in when it's on. The label goes inside.

```html
<su-lib-switch [(checked)]="notify">Email me about new games</su-lib-switch>

<su-lib-switch labelPosition="start" size="small" [checked]="isPublic()" [busy]="saving()" (checkedChange)="save($event)">
  <strong>Show me on the leaderboard</strong>
  <small>Others see your screen name and best scores</small>
</su-lib-switch>
```

| Input / output | Default | Description |
|---|---|---|
| `checked` / `checkedChange` | `false` | Whether it's on; `[(checked)]` binds both ways |
| `labelPosition` | `'end'` | `'end'`: label after the switch; `'start'`: label first, switch at the end of the row |
| `size` | `'medium'` | `'small'` or `'medium'` |
| `disabled` | `false` | |
| `busy` | `false` | While saving: clicks are ignored and `aria-busy` is set; once done it shows `checked` again, so a change that failed to save flips back |

| Variable | Default |
|---|---|
| `--su-switch-on` / `--su-switch-tick` | `#111` / `#fff` (the knob and the tick when on) |
| `--su-switch-track-on` | the on colour at 35% |
| `--su-switch-knob-off` / `--su-switch-track-off` / `--su-switch-border` | grey / a faint tint / a soft line |
| `--su-switch-width` / `--su-switch-height` | `3rem` / `1.75rem` (`--su-switch-small-width`, `--su-switch-small-height`: `2.125rem` / `1.25rem`) |
| `--su-switch-label-weight` / `--su-switch-focus-outline` | `500` / `2px solid currentColor` |

## Email field

An email input that checks the address the way people mistype it: no @, nothing before or after it, no dot in the
domain, spaces, or a one-letter ending. It stays quiet while you type and says what's wrong once you leave the field;
a tick shows when the address looks right. For a likely typo in a common domain it offers the fix, applied with one tap:
`jo@gmial.com` → "Did you mean jo@gmail.com?"

```html
<su-lib-email-field label="Email" required [(value)]="email" (validityChange)="emailOk.set($event)" />
```

| Input / output | Default | Description |
|---|---|---|
| `value` | `''` | The address; `[(value)]` binds both ways |
| `label` | — | The visible label |
| `placeholder` | — | |
| `required` | `false` | An empty field counts as a problem |
| `domains` | common providers | Domains to suggest for a typo, e.g. your company's |
| `messages` | English | `Partial<SuEmailMessages>`: the problem texts and "Did you mean" |
| `validityChange` | — | Whether the address is valid, on every change |

The check itself is exported: `suCheckEmail(value, domains?)` gives `{ valid, problem, suggestion }`.

## Checkbox

A real checkbox whose tick draws itself in, with a small squash when pressed and a dash when partly checked.

```html
<su-lib-checkbox [(checked)]="agree">I agree to the terms</su-lib-checkbox>
<su-lib-checkbox [checked]="all()" [indeterminate]="some()" (checkedChange)="selectAll($event)">Select all</su-lib-checkbox>
```

Inputs: `checked` / `checkedChange` (`[(checked)]`), `indeterminate`, `disabled`. Size and tick colour:
`--su-checkbox-size` (`1.25rem`), `--su-checkbox-tick` (`#fff`); the box uses `--su-field-accent` when checked.

## Chips

Toggle chips to pick several options, or one with `multiple` off. Each is a button (`aria-pressed`) that pops a tick in
when picked; the value keeps the options' order and type.

```ts
categories: readonly SuChipOption<Category>[] = [
  { value: 'tools', label: 'Tools' },
  { value: 'garden', label: 'Garden' },
];
picked = signal<readonly Category[]>([]);
```

```html
<su-lib-chips label="Categories" [options]="categories" [(value)]="picked" />
```

Inputs: `options` (`{ value, label, disabled? }`), `value` (`[(value)]`), `label` (the group's name for screen readers),
`multiple` (`true`). Spacing: `--su-chips-gap` (`0.5rem`).

## Theming

Set these CSS variables (each has a fallback):

| Variable | Used for |
|---|---|
| `--su-field-surface` | Box background |
| `--su-field-border` | Box border |
| `--su-field-filled-border` | Border of a filled box |
| `--su-field-text` | Letters in the boxes |
| `--su-field-accent` | The box the next letter goes into |
| `--su-field-success`, `--su-field-success-bg` | A complete code, a strong password |
| `--su-field-warning` | A fair password |
| `--su-field-danger` | A weak password |
| `--su-field-track` | Empty meter bars |
| `--su-field-font-mono` | Letters in the boxes |

## License

MIT
