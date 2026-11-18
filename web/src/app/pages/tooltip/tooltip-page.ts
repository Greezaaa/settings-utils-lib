import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SuTooltipOpenOn, SuTooltipPlacement, SuTooltipTrigger } from '@su-labs/core/tooltip';
import { SuTooltipComponent } from '@su-labs/tooltip';
import { getUtility } from '../../core/packages';
import { CodeTab } from '../../shared/code-tabs';
import { PageFeatureExample } from '../../shared/page-feature';
import { UtilityPage } from '../../shared/utility-page';
import { TOOLTIP_FEATURES } from './tooltip-features';

const PLACEMENTS: readonly SuTooltipPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
];

const GRID: readonly SuTooltipPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'left',
  'right',
  'bottom-start',
  'bottom',
  'bottom-end',
];

const TRIGGERS: readonly SuTooltipTrigger[] = ['content', 'icon'];

const OPEN_ON: readonly SuTooltipOpenOn[] = ['hover', 'click'];

const USAGE: readonly CodeTab[] = [
  {
    label: 'Angular',
    code: `<su-lib-tooltip text="Saves a draft">Save</su-lib-tooltip>

<su-lib-tooltip openOn="click" interactive [text]="help">Shipping</su-lib-tooltip>
<ng-template #help>Free over 50 €. <a href="/shipping">Read more</a></ng-template>

<su-lib-tooltip trigger="icon" width="18rem" text="Prices include VAT." />`,
  },
  {
    label: 'Other frameworks',
    code: `import { SuTooltipController, suTooltipPosition } from '@su-labs/core/tooltip';

const tooltip = new SuTooltipController({ showDelay: 300, hideDelay: 100 });

trigger.addEventListener('pointerenter', () => tooltip.show());
trigger.addEventListener('pointerleave', () => tooltip.hide());
tooltip.state.subscribe(({ open }) => {
  panel.hidden = !open;
  if (!open) return;
  const { x, y, side, arrow } = suTooltipPosition(trigger.getBoundingClientRect(), panel.getBoundingClientRect(), {
    placement: 'top',
    viewport: { width: innerWidth, height: innerHeight },
  });
  Object.assign(panel.style, { left: \`\${x}px\`, top: \`\${y}px\` });
});`,
  },
  {
    label: 'CSS',
    code: `su-lib-tooltip {
  --su-tooltip-background: #0f172a;
  --su-tooltip-text-color: #f8fafc;
  --su-tooltip-max-width: 18rem;
  --su-tooltip-icon-background: #2563eb;
}`,
  },
];

@Component({
  selector: 'app-tooltip-page',
  imports: [PageFeatureExample, SuTooltipComponent, UtilityPage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tooltip-page.html',
  styleUrl: './tooltip-page.scss',
})
export class TooltipPage {
  protected readonly utility = getUtility('tooltip');
  protected readonly usage = USAGE;
  protected readonly features = TOOLTIP_FEATURES;
  protected readonly placements = PLACEMENTS;
  protected readonly grid = GRID;
  protected readonly triggers = TRIGGERS;
  protected readonly openOnOptions = OPEN_ON;

  protected readonly placement = signal<SuTooltipPlacement>('top');
  protected readonly trigger = signal<SuTooltipTrigger>('content');
  protected readonly openOn = signal<SuTooltipOpenOn>('hover');
  protected readonly interactive = signal(false);
  protected readonly animated = signal(true);
  protected readonly width = signal('18rem');
  protected readonly open = signal(false);

  protected choose<T extends string>(options: readonly T[], set: (value: T) => void, event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const { value } = event.target;
      const option = options.find((item) => item === value);
      if (option) {
        set(option);
      }
    }
  }

  protected setFlag(flag: (value: boolean) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      flag(event.target.checked);
    }
  }

  protected setText(text: (value: string) => void, event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      text(event.target.value);
    }
  }
}
