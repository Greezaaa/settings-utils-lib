# Dialog

`@su-labs/dialog`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Version](https://img.shields.io/npm/v/@su-labs/dialog?style=for-the-badge)

Confirm and message dialogs for Angular, built on the native `<dialog>` element: accessible out of the box, answered
with a promise, and styled entirely through CSS variables so they follow your theme.

> **Not using Angular?** The same dialog logic is in [`@su-labs/core/dialog`](https://www.npmjs.com/package/@su-labs/core).

## Features

- **Two kinds**: one button (`alert`), or accept and cancel (`confirm`), with your own labels
- **A promise for the answer**: `if (await dialog.confirm({ … }))`
- **Rich text**: the body can be HTML (lists, `<small>`, links, images), sanitized by Angular; plus an optional picture
- **Backdrop**: dimmed (any colour and opacity) or clear
- **Accessible**: native `<dialog>`, focus kept inside, Escape to cancel, title and text announced to screen readers;
  a `danger` dialog starts on Cancel so Enter never confirms it by accident
- **One at a time**: dialogs opened meanwhile wait their turn
- **Themeable**: every colour, size and spacing is a `--su-dialog-*` CSS variable

## Installation

```bash
npm install @su-labs/dialog
```

Peer dependencies: `@angular/core` and `@angular/common` 22.

## Quick Start

Add the component once, e.g. at the end of your app's shell:

```ts
import { SuDialogComponent } from '@su-labs/dialog';

@Component({
  selector: 'app-root',
  imports: [SuDialogComponent],
  template: `<router-outlet /> <su-lib-dialog />`,
})
export class App {}
```

Then ask from anywhere:

```ts
import { SuDialogService } from '@su-labs/dialog';

export class AccountPage {
  private readonly dialog = inject(SuDialogService);

  async deleteResults(): Promise<void> {
    const accepted = await this.dialog.confirm({
      title: 'Delete all your results?',
      body: '<p>This removes:</p><ul><li>your plays</li><li>your best results</li></ul><small>It can’t be undone.</small>',
      acceptLabel: 'Delete',
      cancelLabel: 'Keep them',
      danger: true,
    });
    if (accepted) {
      // …
    }
  }
}
```

Set defaults once, e.g. the labels in the page's language:

```ts
dialog.configure({ acceptLabel: 'Aceptar', cancelLabel: 'Cancelar', backdropOpacity: 0.6 });
```

## API

### SuDialogService

| Member | Description |
|--------|-------------|
| `confirm(options)` | Accept and cancel; resolves with `true` when accepted, `false` for cancel, Escape or a click outside |
| `alert(options)` | One button; resolves when closed |
| `open(options)` | Either, by `kind` (`'confirm'` or `'ok'`) |
| `configure(config)` | Defaults for every dialog from now on |
| `current` | Signal of the dialog on screen, or `null` |
| `close(accepted)` | Closes the dialog on screen (the component calls it) |

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `title` | — | The heading |
| `body` | — | Text under it; may be HTML |
| `image` | — | `{ src, alt }`, a picture above the text |
| `acceptLabel` / `cancelLabel` | `'OK'` / `'Cancel'` | Button labels |
| `danger` | `false` | Red accept button, focus starts on Cancel |
| `width` / `height` | `28rem` / content | Any CSS length; always kept inside the screen |
| `backdrop` | `'dim'` | `'dim'` tints the page behind, `'none'` leaves it clear |
| `backdropColor` | black | Any CSS colour for the tint |
| `backdropOpacity` | `0.5` | How much the tint covers, from 0 to 1 |
| `dismissible` | `true` | Whether Escape and a click outside close it as cancel |
| `cssClass` | — | Extra class on the `<dialog>`, to style one dialog its own way |

## Styling

Every part reads a CSS variable. Set them on `:root` (your theme), on `su-lib-dialog`, or on `.su-dialog.your-class`:

```css
:root {
  --su-dialog-background: var(--surface);
  --su-dialog-text-color: var(--text);
  --su-dialog-radius: 16px;
  --su-dialog-accept-background: var(--accent);
}
```

| Variable | Default |
|----------|---------|
| `--su-dialog-width` / `--su-dialog-height` | `28rem` / `auto` |
| `--su-dialog-max-width` / `--su-dialog-max-height` | `calc(100vw - 2rem)` / `calc(100dvh - 2rem)` |
| `--su-dialog-background` | `#fff` |
| `--su-dialog-text-color` | `#333` |
| `--su-dialog-border` | `1px solid rgb(0 0 0 / 0.08)` |
| `--su-dialog-radius` | `12px` |
| `--su-dialog-shadow` | `0 20px 50px rgb(0 0 0 / 0.25)` |
| `--su-dialog-padding` / `--su-dialog-gap` | `1.5rem` / `1rem` |
| `--su-dialog-font-family` | `inherit` |
| `--su-dialog-title-color` / `--su-dialog-title-font-family` / `--su-dialog-title-size` | `inherit` / `inherit` / `1.25rem` |
| `--su-dialog-body-size` | `1rem` |
| `--su-dialog-image-max-height` / `--su-dialog-image-radius` | `12rem` / `8px` |
| `--su-dialog-backdrop` | `rgb(0 0 0 / 0.5)` |
| `--su-dialog-actions-gap` / `--su-dialog-actions-align` | `0.5rem` / `flex-end` |
| `--su-dialog-button-radius` / `--su-dialog-button-padding` / `--su-dialog-button-weight` | `8px` / `0.5rem 1.25rem` / `600` |
| `--su-dialog-accept-background` / `--su-dialog-accept-color` / `--su-dialog-accept-border` | `#111` / `#fff` / `1px solid transparent` |
| `--su-dialog-cancel-background` / `--su-dialog-cancel-color` / `--su-dialog-cancel-border` | `transparent` / `inherit` / `1px solid rgb(0 0 0 / 0.2)` |
| `--su-dialog-danger-background` / `--su-dialog-danger-color` | `#b42318` / `#fff` |
| `--su-dialog-focus-outline` | `2px solid currentColor` |
| `--su-dialog-duration` | `180ms` (no animation with reduced motion) |

The options `width`, `height`, `backdropColor` and `backdropOpacity` win over these for that dialog.

## Browser Compatibility

Uses the native `<dialog>` element and `color-mix()`: Chrome, Edge, Firefox and Safari from 2023 on.

## License

MIT
