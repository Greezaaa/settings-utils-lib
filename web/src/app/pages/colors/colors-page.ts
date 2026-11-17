import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Clipboard } from '../../shared/clipboard';
import { CodeBlock } from '../../shared/code-block';
import { CodeTab, CodeTabs } from '../../shared/code-tabs';
import { parseHex } from '../../shared/color';
import { ColorField } from '../../shared/color-field/color-field';
import { Reveal } from '../../shared/reveal';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { cleanName, colorFormats, paletteOf, Shade } from './colors';

const DEFAULT_COLOR = '#3b82f6';
const DEFAULT_NAME = 'brand';

@Component({
  selector: 'app-colors-page',
  imports: [CodeBlock, CodeTabs, ColorField, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './colors-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './colors-page.scss'],
})
export class ColorsPage {
  private readonly clipboard = inject(Clipboard);

  protected readonly color = signal(parseHex(readQueryParam('color')) ?? DEFAULT_COLOR);
  protected readonly name = signal(cleanName(readQueryParam('name') ?? DEFAULT_NAME));

  protected readonly formats = computed(() => colorFormats(this.color()));
  protected readonly palette = computed(() => paletteOf(this.color()));
  protected readonly paletteCode = computed<readonly CodeTab[]>(() => [
    { label: 'Hex', code: this.variables((shade) => shade.hex) },
    { label: 'OKLCH', code: this.variables((shade) => shade.oklch) },
  ]);

  constructor() {
    syncQueryParams(() => ({
      color: this.color() === DEFAULT_COLOR ? undefined : this.color().slice(1),
      name: this.name() === DEFAULT_NAME ? undefined : this.name(),
    }));
  }

  protected setName(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.name.set(cleanName(event.target.value));
      event.target.value = this.name();
    }
  }

  protected copyShade(shade: Shade): Promise<void> {
    return this.clipboard.copy(shade.hex, `Copied ${shade.hex}.`);
  }

  private variables(value: (shade: Shade) => string): string {
    const lines = this.palette().map((shade) => `  --${this.name()}-${shade.step}: ${value(shade)};`);
    return `:root {\n${lines.join('\n')}\n}`;
  }
}
