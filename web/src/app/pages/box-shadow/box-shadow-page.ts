import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { ColorField } from '../../shared/color-field/color-field';
import { Reveal } from '../../shared/reveal';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { clampOpacity, clampShadowNumber, DEFAULT_LAYERS, formatShadow, formatShadowCss, newLayer, parseShadow, serializeShadow, SHADOW_PRESETS, SHADOW_RANGES, ShadowLayer, ShadowNumber, ShadowPreset } from './box-shadow';

const QUERY_KEY = 'shadow';

type Stage = 'light' | 'dark';

const STAGES: readonly { readonly value: Stage; readonly label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const PRESETS = SHADOW_PRESETS.map((preset) => ({ ...preset, shadow: formatShadow(preset.layers) }));

@Component({
  selector: 'app-box-shadow-page',
  imports: [CodeBlock, ColorField, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './box-shadow-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './box-shadow-page.scss'],
})
export class BoxShadowPage {
  protected readonly layers = signal<readonly ShadowLayer[]>(parseShadow(readQueryParam(QUERY_KEY)) ?? DEFAULT_LAYERS);
  protected readonly selectedId = signal(0);
  protected readonly stage = signal<Stage>('light');

  protected readonly ranges = SHADOW_RANGES;
  protected readonly stages = STAGES;
  protected readonly presets = PRESETS;

  protected readonly shadow = computed(() => formatShadow(this.layers()));
  protected readonly code = computed(() => `.element {\n  ${formatShadowCss(this.layers())}\n}`);
  protected readonly match = computed(() => SHADOW_PRESETS.find((preset) => this.sameAs(preset.layers)));
  protected readonly selected = computed<ShadowLayer>(
    () => this.layers().find((layer) => layer.id === this.selectedId()) ?? this.layers()[0],
  );
  protected readonly opacityPercent = computed(() => Math.round(this.selected().opacity * 100));

  constructor() {
    syncQueryParams(() => ({
      [QUERY_KEY]: this.sameAs(DEFAULT_LAYERS) ? undefined : serializeShadow(this.layers()),
    }));
  }

  protected load(preset: ShadowPreset): void {
    this.layers.set(preset.layers);
    this.selectedId.set(preset.layers[0].id);
  }

  protected addLayer(): void {
    const id = Math.max(...this.layers().map((layer) => layer.id)) + 1;
    this.layers.update((layers) => [...layers, newLayer(id)]);
    this.selectedId.set(id);
  }

  protected removeLayer(): void {
    if (this.layers().length <= 1) {
      return;
    }
    const remaining = this.layers().filter((layer) => layer.id !== this.selected().id);
    this.layers.set(remaining);
    this.selectedId.set(remaining[0].id);
  }

  protected setNumber(key: ShadowNumber, event: Event): void {
    if (event.target instanceof HTMLInputElement && Number.isFinite(event.target.valueAsNumber)) {
      this.updateSelected({ [key]: clampShadowNumber(key, event.target.valueAsNumber) });
    }
  }

  protected setOpacity(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.updateSelected({ opacity: clampOpacity(event.target.valueAsNumber / 100) });
    }
  }

  protected setInset(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.updateSelected({ inset: event.target.checked });
    }
  }

  protected setColor(color: string): void {
    this.updateSelected({ color });
  }

  private updateSelected(change: Partial<Omit<ShadowLayer, 'id'>>): void {
    const id = this.selected().id;
    this.layers.update((layers) => layers.map((layer) => (layer.id === id ? { ...layer, ...change } : layer)));
  }

  private sameAs(layers: readonly ShadowLayer[]): boolean {
    return serializeShadow(layers) === serializeShadow(this.layers());
  }
}
