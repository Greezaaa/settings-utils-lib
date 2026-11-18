import { PageFeature } from '../../shared/page-feature';

export const SELECT_FEATURES = {
  search: {
    title: 'Search inside the list',
    description:
      'With searchable a field at the top of the list filters the options as you type, ignoring case and accents, ' +
      'while the arrows still move through what’s left.',
    code: `<su-lib-select searchable [options]="countries" [(value)]="country" />`,
  },
  groups: {
    title: 'Groups and disabled options',
    description:
      'Options sharing a group are listed under its heading. Disabled options stay in the list so people see they ' +
      'exist, but the keyboard skips them and a click does nothing.',
    code: `options = [
  { value: 'standard', label: 'Standard', group: 'Ground' },
  { value: 'express', label: 'Express', group: 'Ground' },
  { value: 'drone', label: 'Drone', group: 'Air', disabled: true },
];`,
  },
  keyboard: {
    title: 'The whole keyboard',
    description:
      'Arrows, Home and End move, typing jumps to a matching option (and chooses it while closed, like a native ' +
      'select), Enter or Space choose, Escape closes and Tab chooses and moves on. Screen readers follow along ' +
      'through aria-activedescendant.',
    code: `<label>
  Size
  <su-lib-select [options]="sizes" [(value)]="size" />
</label>`,
  },
  layer: {
    title: 'Never cut off',
    description:
      'The list opens in the top layer, so a box with overflow: hidden or a low z-index can’t clip it. Near the ' +
      'bottom of the screen it opens above the trigger instead.',
    code: `<div style="overflow: hidden; height: 3rem">
  <su-lib-select [options]="sizes" [(value)]="size" />
</div>`,
  },
  theming: {
    title: 'Your own look',
    description:
      'The trigger, list, options, focus ring, radius and timing are all CSS variables, and the list looks the same ' +
      'in every browser and on every system.',
    code: `su-lib-select {
  --su-select-background: #fef3c7;
  --su-select-color: #78350f;
  --su-select-border: 1px solid #f59e0b;
  --su-select-radius: 999px;
  --su-select-option-active-background: #fde68a;
}`,
  },
} satisfies Record<string, PageFeature>;
