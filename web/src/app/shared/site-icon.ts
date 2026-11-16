import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { isSiteLogo, SITE_ICONS, SiteIconName } from '../core/site-icons';

/** A line icon from the site's set, or an app's logo; decorative, so its button or link carries the name */
@Component({
  selector: 'app-site-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (name()) {
      @case ('reminder') {
        <svg class="logo" viewBox="0 0 64 64" [attr.width]="size()" [attr.height]="size()">
          <g class="logo-ink-line">
            <circle cx="32" cy="32" r="22" stroke-width="5.5" />
            <path d="M32 19.5V32l9 5.2" stroke-width="5" />
          </g>
          <circle cx="52" cy="12" r="8.5" fill="#f6722a" />
        </svg>
      }
      @case ('smartiplay') {
        <svg class="logo" viewBox="0 0 128 128" [attr.width]="size()" [attr.height]="size()">
          <rect class="logo-ink" width="128" height="128" rx="28" />
          <rect class="logo-paper" x="18" y="18" width="43" height="43" rx="10" />
          <rect class="logo-dim" x="67" y="18" width="43" height="43" rx="10" />
          <rect class="logo-dim" x="18" y="67" width="43" height="43" rx="10" />
          <rect class="logo-paper" x="67" y="67" width="43" height="43" rx="10" />
          <g fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
            <path class="logo-ink-stroke" d="M49 30c-2-3-5-5-9-5-5 0-8 3-8 7 0 9 17 5 17 15 0 5-4 8-9 8-4 0-8-2-10-6" />
            <path class="logo-paper-stroke" d="M88.5 37v15" />
            <path class="logo-ink-stroke" d="M81 106V76h9c7 0 10 4 10 9s-3 9-10 9h-9" />
          </g>
          <circle cx="88.5" cy="28" r="4.5" fill="#ef9f27" />
        </svg>
      }
      @default {
        <svg class="line" viewBox="0 0 24 24" [attr.width]="size()" [attr.height]="size()">
          @for (path of paths(); track $index) {
            <path [attr.d]="path" />
          }
        </svg>
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }

    .line {
      fill: none;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 1.75;
    }

    .logo-ink {
      fill: var(--heading);
    }

    .logo-paper {
      fill: var(--bg);
    }

    .logo-dim {
      fill: color-mix(in srgb, var(--heading) 80%, var(--bg));
    }

    .logo-ink-stroke {
      stroke: var(--heading);
    }

    .logo-paper-stroke {
      stroke: var(--bg);
    }

    .logo-ink-line {
      fill: none;
      stroke: var(--heading);
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class SiteIcon {
  readonly name = input.required<SiteIconName>();
  readonly size = input(18);

  protected readonly paths = computed(() => {
    const name = this.name();
    return isSiteLogo(name) ? [] : SITE_ICONS[name];
  });
}
