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
