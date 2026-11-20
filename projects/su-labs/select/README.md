# Select

`@su-labs/select`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

A select for Angular with its own styled list instead of the browser's popup:

- **Styled to match**: the trigger and the list follow your theme through CSS variables, the same in every browser and on every system.
- **Search**: an optional field at the top of the list filters the options, ignoring case and accents.
- **Groups and disabled options**: headings over related options; disabled options are shown but can't be chosen.
- **Keyboard**: arrows, Home and End, type-ahead (even while closed, like a native select), Enter or Space to choose, Escape to close, Tab to choose and move on.
- **Never cut off**: the list opens in the top layer, below the trigger or above it when there's no room.
- **Accessible**: the WAI-ARIA select-only combobox pattern, with `aria-expanded` and `aria-activedescendant`.

## Installation

```bash
npm install @su-labs/select
```

On Angular 19, 20 or 21, install the matching version: `npm install @su-labs/select@ng19`, `@ng20` or `@ng21`.

## Usage

```ts
import { SuSelectOption } from '@su-labs/core/select';
import { SuSelectComponent } from '@su-labs/select';

@Component({
  imports: [SuSelectComponent],
})
export class Settings {
  readonly sizes: SuSelectOption<string>[] = [
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large', disabled: true },
  ];
  readonly size = signal<string | null>('m');
}
```

```html
<label>
  Size
  <su-lib-select [options]="sizes" [(value)]="size" />
</label>

<su-lib-select
  [options]="countries"
  [(value)]="country"
  searchable
  aria-label="Country" />
```

An option is `{ value, label, disabled?, group? }`; options sharing a `group` are listed under its heading, so keep them next to each other. The value can be any type: it's compared with `Object.is`, so objects must be the same instances as in `options`.

`value` is a `model()`, so it works with `[(value)]`, signals and signal forms. To keep a signal that is never `null`, bind `[value]="size()" (chosen)="size.set($event)"`. A `<label>` around the select names it; otherwise use `ariaLabel` or `ariaLabelledby`.

| Input            | Default     |                                                     |
| ---------------- | ----------- | --------------------------------------------------- |
| `options`        | `[]`        | The choices: `SuSelectOption<T>[]`                  |
| `[(value)]`      | `null`      | The chosen value, or `null` while nothing is chosen |
| `[(open)]`       | `false`     | Whether the list is open                            |
| `[(touched)]`    | `false`     | Set once focus has left the select                  |
| `searchable`     | `false`     | A search field at the top of the list               |
| `disabled`       | `false`     | Can't be opened or focused                          |
| `animated`       | `true`      | The list springs open and fades out                 |
| `placeholder`    | `'Choose…'` | Shown while nothing is chosen                       |
| `ariaLabel`      | —           | The select's name, without a `<label>`              |
| `ariaLabelledby` | —           | The id of the element that names it                 |
| `labels`         | English     | Texts to replace: `placeholder`, `search`, `empty`  |

| Output     |                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| `(chosen)` | The user chose an option: its value, typed `T` (never `null`); not emitted when `value` is set from outside |

| Method    |                            |
| --------- | -------------------------- |
| `focus()` | Moves focus to the trigger |

## Accessibility

- The trigger is a button with `role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`; the list is a `listbox` of `option`s with `aria-selected` and `aria-disabled`, and groups are `role="group"` named by their heading.
- Focus stays on the trigger; `aria-activedescendant` points at the option the keyboard is on. With `searchable`, focus moves to the search field while the list is open, and it carries `aria-activedescendant` instead.
- Closed: ↓, ↑, Enter or Space open the list; Home and End open it on the first or last option; typing a letter chooses the next option starting with it.
- Open: ↑ and ↓ move (skipping disabled options), Home and End or Page Up and Page Down jump to either end, typing jumps to a matching option, Enter, Space or Alt + ↑ choose, Escape closes, Tab chooses and moves on.
- A click outside, focus leaving or scrolling the trigger out of view closes it, like a native select. Animation is off when the user prefers reduced motion.

The list opens in the top layer (`popover="manual"`), so no `overflow: hidden` or `z-index` around it cuts it off.

## Theming

| Variable                               | Default                           |                                            |
| -------------------------------------- | --------------------------------- | ------------------------------------------ |
| `--su-select-background`               | `#fff`                            | The trigger, and the list unless set apart |
| `--su-select-color`                    | `#111827`                         |                                            |
| `--su-select-muted-color`              | `#6b7280`                         | Placeholder, chevron, group headings       |
| `--su-select-border`                   | `1px solid #d1d5db`               |                                            |
| `--su-select-hover-border-color`       | `#9ca3af`                         |                                            |
| `--su-select-radius`                   | `0.375rem`                        |                                            |
| `--su-select-padding`                  | `0.375rem 0.625rem`               |                                            |
| `--su-select-height`                   | `2.25rem`                         | The trigger's least height                 |
| `--su-select-min-width`                | `8rem`                            |                                            |
| `--su-select-font-size`                | `0.875rem`                        |                                            |
| `--su-select-focus-ring`               | `0 0 0 3px rgb(37 99 235 / 0.35)` | A `box-shadow`                             |
| `--su-select-disabled-opacity`         | `0.5`                             |                                            |
| `--su-select-list-background`          | the background                    |                                            |
| `--su-select-list-border`              | the border                        |                                            |
| `--su-select-list-radius`              | `0.5rem`                          |                                            |
| `--su-select-list-shadow`              | `0 10px 30px rgb(0 0 0 / 0.12)`   |                                            |
| `--su-select-list-padding`             | `0.25rem`                         |                                            |
| `--su-select-list-max-height`          | `18rem`                           |                                            |
| `--su-select-search-border`            | `1px solid #e5e7eb`               | Under the search field                     |
| `--su-select-option-padding`           | `0.4rem 0.5rem`                   |                                            |
| `--su-select-option-radius`            | `0.3125rem`                       |                                            |
| `--su-select-option-active-background` | `#f3f4f6`                         | The option under the keyboard or pointer   |
| `--su-select-option-selected-color`    | `inherit`                         |                                            |
| `--su-select-option-selected-weight`   | `600`                             |                                            |
| `--su-select-duration`                 | `380ms`                           | Opening, with a small bounce               |
| `--su-select-close-duration`           | `140ms`                           | Closing                                    |
| `--su-select-z-index`                  | `1000`                            | Only in browsers without the popover API   |

```css
su-lib-select {
  --su-select-background: #0f172a;
  --su-select-color: #f8fafc;
  --su-select-border: 1px solid #334155;
  --su-select-option-active-background: #1e293b;
}
```

## Without Angular

Opening, the active option, search, groups and type-ahead come from [`@su-labs/core/select`](https://www.npmjs.com/package/@su-labs/core), for vanilla JS, React, Vue or Svelte.

## License

MIT
