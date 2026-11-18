import { PageFeature } from '../../shared/page-feature';

export const TOOLTIP_FEATURES = {
  placements: {
    title: 'Twelve placements',
    description:
      'Top, right, bottom or left, each centred or lined up with the trigger’s start or end. The arrow always points ' +
      'at the trigger, and when the asked side has no room the tooltip moves to the other one and stays on screen.',
    code: `<su-lib-tooltip text="Lined up with the start" placement="bottom-start">
  Bottom start
</su-lib-tooltip>`,
  },
  click: {
    title: 'Hover or click',
    description:
      'A hover tooltip opens when the pointer rests on its trigger or the keyboard focuses it, and closes once they ' +
      'leave. With openOn="click" it stays open until it’s clicked again, a click outside or Escape.',
    code: `<su-lib-tooltip text="Stays until you close it" openOn="click">
  Click me
</su-lib-tooltip>`,
  },
  interactive: {
    title: 'Interactive or not',
    description:
      'By default the pointer goes through the tooltip, so it never gets in the way of what’s under it. With ' +
      'interactive the pointer can move onto it, over an invisible bridge across the gap, to click a link inside.',
    code: `<su-lib-tooltip interactive [text]="help">Shipping</su-lib-tooltip>
<ng-template #help>
  Free over 50 €. <a href="/shipping">Read more</a>
</ng-template>`,
  },
  icon: {
    title: 'An icon that becomes the tooltip',
    description:
      'With trigger="icon" a "?" button follows the content. The tooltip grows out of it, as wide as you ask and as ' +
      'tall as its text, and the "?" turns into the close button. Closing shrinks it back into the icon. Swap the ' +
      '"?" for a short text or your own SVG with icon.',
    code: `<su-lib-tooltip trigger="icon" width="18rem" text="Prices include VAT.">
  Price
</su-lib-tooltip>
<su-lib-tooltip trigger="icon" icon="i" text="Your own icon" />`,
  },
  motion: {
    title: 'Animated or not',
    description:
      'Tooltips grow out of their trigger, from the arrow’s tip. Turn it off with [animated]="false"; it’s off by ' +
      'itself when the user prefers less motion.',
    code: `<su-lib-tooltip text="Appears at once" [animated]="false">No motion</su-lib-tooltip>`,
  },
  theming: {
    title: 'Your own look',
    description: 'The colours, radius, padding, shadow, font, width, arrow, icon and timing are all CSS variables.',
    code: `su-lib-tooltip {
  --su-tooltip-background: #fef3c7;
  --su-tooltip-text-color: #78350f;
  --su-tooltip-radius: 1rem;
  --su-tooltip-arrow-size: 10px;
  --su-tooltip-icon-background: #f59e0b;
  --su-tooltip-icon-color: #451a03;
  --su-tooltip-duration: 320ms;
}`,
  },
} satisfies Record<string, PageFeature>;
