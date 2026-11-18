# Tooltip

`@su-labs/tooltip`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Tooltips for Angular:

- **On your content**: whatever you put between the tags is the trigger: a word, a button, a link.
- **Or a "?" icon**: the tooltip grows out of the icon, as wide as you ask and as tall as its text, and the "?" turns into its close button.
- **Hover or click**: opens on hover and keyboard focus and closes once they leave, or opens on click and stays until it's closed.
- **Interactive or not**: by default the pointer goes through the tooltip, so it never covers what the user moves to; interactive ones let the pointer move onto them, e.g. to click a link.
- **Twelve placements**: top, right, bottom or left, each centred or lined up with the start or end, with an arrow pointing at the trigger. It moves to the other side when there's no room and stays on screen.
- **Animated**: grows out of the trigger and back into it, or not at all; off when the user prefers less motion.
- **Accessible**: `role="tooltip"` with `aria-describedby`, or a button with `aria-expanded`; Escape closes it.

## Installation

```bash
npm install @su-labs/tooltip
```

On Angular 19, 20 or 21, install the matching version: `npm install @su-labs/tooltip@ng19`, `@ng20` or `@ng21`.

## Usage

```ts
import { SuTooltipComponent } from '@su-labs/tooltip';

@Component({
  imports: [SuTooltipComponent],
})
```

```html
<su-lib-tooltip text="Saves a draft">Save</su-lib-tooltip>

<su-lib-tooltip text="Saves a draft" placement="bottom-start">
  <button type="button">Save</button>
</su-lib-tooltip>

<su-lib-tooltip openOn="click" interactive [text]="help">Shipping</su-lib-tooltip>
<ng-template #help>Free over 50 €. <a href="/shipping">Read more</a></ng-template>

<su-lib-tooltip trigger="icon" width="18rem" text="Prices include VAT." />
<su-lib-tooltip trigger="icon" text="Prices include VAT.">Price</su-lib-tooltip>
```

```html
<su-lib-tooltip trigger="icon" icon="i" text="Good to know" />

<su-lib-tooltip trigger="icon" [icon]="info" text="Good to know" />
<ng-template #info><svg viewBox="0 0 24 24" width="60%" height="60%">…</svg></ng-template>
```

The content is the trigger and `text` is what the tooltip shows: a string, or an `<ng-template>` for links and markup. With `trigger="icon"`, the content is a label shown before the "?".

| Input | Default | |
|---|---|---|
| `text` | `''` | What the tooltip shows: a string or a `TemplateRef` |
| `trigger` | `'content'` | `'content'` (the content between the tags) or `'icon'` (a "?" button after it) |
| `icon` | the "?" | Your own icon: a short text such as `'i'`, or an `<ng-template>` with an SVG; it turns into the "×" too |
| `placement` | `'top'` | `top`, `right`, `bottom`, `left`, each also with `-start` or `-end` |
| `openOn` | `'hover'`, `'click'` for the icon | `'hover'` (and keyboard focus) or `'click'` |
| `interactive` | `false` | The pointer can move onto a hover tooltip; always on with `click` |
| `animated` | `true` | Grows out of the trigger and back into it |
| `width` | — | Any CSS length; without it, the tooltip fits its text up to `--su-tooltip-max-width`, `16rem` for the icon |
| `arrow` | `true` | The arrow pointing at the trigger (not on icon tooltips) |
| `offset` | `8` | Pixels between the trigger and the tooltip |
| `showDelay` | `300` | Milliseconds the pointer rests on the trigger before it opens |
| `hideDelay` | `100` | Milliseconds before it closes once the pointer leaves |
| `disabled` | `false` | Doesn't open, and closes if open |
| `[(open)]` | `false` | Whether it's open; setting it opens or closes it at once |
| `label` | `'More information'` | The "?" icon's name for screen readers |
| `labels` | English | Texts to replace: `more`, `close` |

| Method | |
|---|---|
| `show()` / `hide()` / `toggle()` | Opens or closes it now, through a reference: `<su-lib-tooltip #tip>` and `(click)="tip.show()"` |

## Accessibility

- A hover tooltip has `role="tooltip"` and describes its trigger with `aria-describedby`: the content's first focusable element, or the tooltip itself, which becomes focusable when the content is plain text.
- With `openOn="click"`, the trigger has `aria-expanded` and `aria-controls`; plain text content gets `role="button"` and opens with Enter or Space.
- The "?" icon is a button with `aria-expanded`; opening moves focus to the close button in the tooltip, and closing moves it back to the "?".
- Escape closes any open tooltip; a click outside closes it too. Focus goes back to the trigger when it was inside.
- Animation is off when the user prefers reduced motion.

The tooltip opens in the top layer (`popover="manual"`), so no `overflow: hidden` or `z-index` around it cuts it off.

## Theming

| Variable | Default | |
|---|---|---|
| `--su-tooltip-background` | `#1f2937` | |
| `--su-tooltip-text-color` | `#f9fafb` | |
| `--su-tooltip-border` | `0` | |
| `--su-tooltip-radius` | `0.375rem` | |
| `--su-tooltip-padding` | `0.375rem 0.625rem` | |
| `--su-tooltip-shadow` | `0 6px 20px rgb(0 0 0 / 0.18)` | |
| `--su-tooltip-font-family` | `inherit` | |
| `--su-tooltip-font-size` | `0.875rem` | |
| `--su-tooltip-line-height` | `1.45` | |
| `--su-tooltip-max-width` | `20rem` | Without `width` |
| `--su-tooltip-arrow-size` | `8px` | |
| `--su-tooltip-z-index` | `1000` | Only in browsers without the popover API |
| `--su-tooltip-icon-size` | `1.375rem` | The "?" button |
| `--su-tooltip-icon-background` | the tooltip's background | The "?" and the tooltip it grows into |
| `--su-tooltip-icon-color` | the tooltip's text colour | |
| `--su-tooltip-icon-radius` | `0.875rem` | The icon tooltip's corners |
| `--su-tooltip-icon-padding` | `0.5rem 0.75rem` | |
| `--su-tooltip-focus-ring` | `2px solid currentColor` | The "?" and close buttons |
| `--su-tooltip-duration` | `200ms` | |
| `--su-tooltip-easing` | `cubic-bezier(0.2, 0.9, 0.3, 1.1)` | |

```css
su-lib-tooltip {
  --su-tooltip-background: #fef3c7;
  --su-tooltip-text-color: #78350f;
  --su-tooltip-icon-background: #f59e0b;
}
```

## Without Angular

The open state, delays and placement maths come from [`@su-labs/core/tooltip`](https://www.npmjs.com/package/@su-labs/core), for vanilla JS, React, Vue or Svelte.

## License

MIT
