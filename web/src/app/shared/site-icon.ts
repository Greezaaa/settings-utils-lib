import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SITE_ICONS, SiteIconName } from '../core/site-icons';

/** A line icon from the site's set; decorative, so its button or link carries the name */
@Component({
  selector: 'app-site-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()">
      @for (path of paths(); track $index) {
        <path [attr.d]="path" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }

    svg {
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.75;
    }
  `,
})
export class SiteIcon {
  readonly name = input.required<SiteIconName>();
  readonly size = input(18);

  protected readonly paths = computed(() => SITE_ICONS[this.name()]);
}
