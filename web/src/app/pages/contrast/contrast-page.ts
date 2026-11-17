import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { parseHex } from '../../shared/color';
import { ColorField } from '../../shared/color-field/color-field';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { CONTRAST_CHECKS, nearestPassing, ratioBetween, SUGGESTION_TARGETS } from './contrast';

const DEFAULT_TEXT = '#6b7280';
const DEFAULT_BACKGROUND = '#ffffff';

const queryColor = (hex: string): string => hex.slice(1);

@Component({
  selector: 'app-contrast-page',
  imports: [ColorField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contrast-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './contrast-page.scss'],
})
export class ContrastPage {
  protected readonly text = signal(parseHex(readQueryParam('text')) ?? DEFAULT_TEXT);
  protected readonly background = signal(parseHex(readQueryParam('background')) ?? DEFAULT_BACKGROUND);

  protected readonly ratio = computed(() => ratioBetween(this.text(), this.background()));
  protected readonly ratioLabel = computed(() => `${(Math.floor(this.ratio() * 100) / 100).toFixed(2)} : 1`);
  protected readonly checks = computed(() =>
    CONTRAST_CHECKS.map((check) => ({ ...check, passes: this.ratio() >= check.minimum })),
  );
  protected readonly suggestions = computed(() =>
    SUGGESTION_TARGETS.filter((target) => this.ratio() < target.minimum).map((target) => {
      const color = nearestPassing(this.text(), this.background(), target.minimum);
      return { ...target, color, ratio: color ? ratioBetween(color, this.background()).toFixed(2) : undefined };
    }),
  );

  constructor() {
    syncQueryParams(() => ({
      text: this.text() === DEFAULT_TEXT ? undefined : queryColor(this.text()),
      background: this.background() === DEFAULT_BACKGROUND ? undefined : queryColor(this.background()),
    }));
  }

  protected swap(): void {
    const text = this.text();
    this.text.set(this.background());
    this.background.set(text);
  }
}
