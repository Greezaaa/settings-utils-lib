import { PageFeature } from '../../shared/page-feature';

export const STEPPER_FEATURES = {
  numbers: {
    title: 'Numbers or titles',
    description:
      'Every step gets a circle with its number, joined to the next by a line, for as many steps as you add. Give a ' +
      'step a label to show its title beside the number, or leave it out to show only the number.',
    code: `<su-lib-stepper label="Order">
  <su-lib-step>…</su-lib-step>
  <su-lib-step>…</su-lib-step>
  <su-lib-step label="Done">…</su-lib-step>
</su-lib-stepper>`,
  },
  rules: {
    title: 'Rules for going forward and back',
    description:
      'Each step says whether the user may leave it forward, e.g. once its form is valid, and whether they may go ' +
      'back. Next stays focusable while it’s blocked, so screen readers still find it, and a step left forward ' +
      'counts as completed only while it still allows going forward.',
    code: `<su-lib-step label="Terms" [canNext]="agreed()">
  <label>
    <input type="checkbox" (change)="agreed.set(box.checked)" #box />
    I agree
  </label>
</su-lib-step>
<su-lib-step label="Paid" [canBack]="false">…</su-lib-step>`,
  },
  vertical: {
    title: 'Vertical',
    description:
      'The steps in a column beside the content, with the line running down between the circles. On a narrow screen ' +
      'the content moves under the steps.',
    code: `<su-lib-stepper orientation="vertical">
  <su-lib-step label="Plan">…</su-lib-step>
  <su-lib-step label="Build">…</su-lib-step>
  <su-lib-step label="Ship">…</su-lib-step>
</su-lib-stepper>`,
  },
  tabs: {
    title: 'Tabs',
    description:
      'With tabs, a click on a step’s header goes straight to it, still following the rules: a jump checks every ' +
      'step it passes. The arrow keys, Home and End move between the headers, and steps out of reach are announced ' +
      'as unavailable. Linear keeps forward jumps to the steps already visited.',
    code: `<su-lib-stepper tabs linear>
  <su-lib-step label="Profile">…</su-lib-step>
  <su-lib-step label="Billing" disabled>…</su-lib-step>
  <su-lib-step label="Team">…</su-lib-step>
  <su-lib-step label="Review">…</su-lib-step>
</su-lib-stepper>`,
  },
  buttons: {
    title: 'Your own buttons',
    description:
      'Turn the Back and Next buttons off and call the stepper’s own next(), back() and goTo() from yours. They ' +
      'follow the same rules and say whether they moved.',
    code: `<su-lib-stepper #stepper [controls]="false">
  …
</su-lib-stepper>
<button type="button" (click)="stepper.back()">Previous</button>
<button type="button" (click)="stepper.next()">Continue</button>`,
  },
} satisfies Record<string, PageFeature>;
