# Stepper

`@su-labs/stepper`

![Angular Version](https://img.shields.io/badge/Angular-v22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

Content split into steps shown one at a time, for Angular:

- **Numbered steps**: a circle with its number per step, joined by a line, as many steps as you need. Each step can have its own title, or just the number.
- **Rules**: each step says whether the user may go forward (e.g. once its form is valid) and whether they may go back.
- **Horizontal or vertical**: the steps in a row above the content, or in a column beside it.
- **Tabs**: the step headers can act as tabs, so a click goes straight to a step, still following the rules.
- **Accessible**: a list of steps with `aria-current="step"`, or tabs with the arrow keys, Home and End; steps out of reach are announced, and focus moves to the new step's content.

## Installation

```bash
npm install @su-labs/stepper
```

On Angular 19, 20 or 21, install the matching version: `npm install @su-labs/stepper@ng19`, `@ng20` or `@ng21`.

## Usage

```ts
import { SuStepComponent, SuStepperComponent } from '@su-labs/stepper';

@Component({
  imports: [SuStepComponent, SuStepperComponent],
})
```

```html
<su-lib-stepper label="Sign up" [(current)]="step">
  <su-lib-step label="Account" [canNext]="name().length > 0">
    <label>Name <input #nameInput [value]="name()" (input)="name.set(nameInput.value)" /></label>
  </su-lib-step>
  <su-lib-step label="Address">…</su-lib-step>
  <su-lib-step label="Confirm" [canBack]="false">…</su-lib-step>
</su-lib-stepper>
```

Leave `label` out to show only the step's number. A step is completed once the user leaves it forward, as long as it still allows going forward.

### Stepper

| Input | Default | |
|---|---|---|
| `orientation` | `'horizontal'` | `'horizontal'` or `'vertical'` |
| `tabs` | `false` | The step headers act as tabs: a click (or Enter) goes to its step if the rules allow it |
| `linear` | `false` | Going forward by more than one step only reaches steps already visited |
| `controls` | `true` | Back and Next buttons under the steps |
| `[(current)]` | `0` | The step on screen, from 0; setting it shows that step without checking the rules |
| `label` | `'Steps'` | The name of the list of steps for screen readers |
| `labels` | English | Texts to replace: `steps`, `step(number, count)`, `completed`, `unavailable`, `back`, `next` |

| Method | |
|---|---|
| `next()` / `back()` | Goes to the next or previous step that isn't disabled, if the rules allow it; returns whether it moved |
| `goTo(index)` | Goes to a step, from 0, if the rules allow it |
| `reset(start?)` | Back to a step (the first by default) with nothing visited or completed |

To use your own buttons, set `[controls]="false"` and call the methods through a reference: `<su-lib-stepper #stepper>` and `(click)="stepper.next()"`.

### Step

| Input | Default | |
|---|---|---|
| `label` | — | The text beside the step's number |
| `canNext` | `true` | The user may go forward from this step |
| `canBack` | `true` | The user may go back from this step |
| `disabled` | `false` | The step can't be visited; Back and Next skip it |

A jump from a step header checks every step it passes: forward, each one's `canNext`; back, each one's `canBack`.

## Accessibility

- Without `tabs`, the steps are an ordered list and the current one has `aria-current="step"`; each step's content is a group named by its header.
- With `tabs`, the headers are a `tablist` of `tab`s, each controlling its `tabpanel`. The arrow keys, Home and End move between them and Enter or Space goes to the step. Steps out of reach have `aria-disabled` and stay focusable, so they're announced.
- Each header reads out its place, label and state, e.g. "Step 2 of 3, Address, Completed".
- After Back or Next, focus moves to the new step's content. The Next button stays focusable while its step blocks it, with `aria-disabled`.

## Theming

| Variable | Default | |
|---|---|---|
| `--su-stepper-accent` | `#2563eb` | The current step's ring, completed steps and the Next button |
| `--su-stepper-accent-text` | `#ffffff` | Text on the accent |
| `--su-stepper-marker-size` | `2rem` | The circles |
| `--su-stepper-marker-background` | `transparent` | Circles of steps not completed |
| `--su-stepper-marker-border` | `2px solid rgb(0 0 0 / 0.2)` | |
| `--su-stepper-marker-color` | `inherit` | The number |
| `--su-stepper-marker-font-size` | `0.875rem` | |
| `--su-stepper-current-background` | `transparent` | The current step's circle |
| `--su-stepper-current-color` | the accent | The current step's number |
| `--su-stepper-current-label-weight` | `600` | |
| `--su-stepper-label-color` | `inherit` | |
| `--su-stepper-label-font-size` | `0.95rem` | |
| `--su-stepper-line-color` | `rgb(0 0 0 / 0.15)` | The line between steps |
| `--su-stepper-line-done-color` | the accent | The line after a completed step |
| `--su-stepper-line-width` | `2px` | |
| `--su-stepper-step-gap` | `1.5rem` | Room between steps when vertical |
| `--su-stepper-vertical-gap` | `1.5rem` | Room between the steps and the content when vertical |
| `--su-stepper-tab-hover-background` | `rgb(0 0 0 / 0.05)` | Headers acting as tabs |
| `--su-stepper-panel-padding` | `1rem 0` | Each step's content |
| `--su-stepper-button-background` | `transparent` | The Back button |
| `--su-stepper-button-border` | `1px solid rgb(0 0 0 / 0.2)` | |
| `--su-stepper-button-color` | `inherit` | |
| `--su-stepper-button-radius` | `0.5rem` | |
| `--su-stepper-primary-background` | the accent | The Next button |
| `--su-stepper-primary-color` | the accent text | |
| `--su-stepper-disabled-opacity` | `0.45` | Disabled steps and blocked buttons |
| `--su-stepper-focus-ring` | `2px solid currentColor` | |

## Without Angular

The same logic is in [`@su-labs/core`](https://www.npmjs.com/package/@su-labs/core): `SuStepperController` from `@su-labs/core/stepper` keeps the current step, the visited and completed ones and checks each move, and you render the steps.

## License

MIT
