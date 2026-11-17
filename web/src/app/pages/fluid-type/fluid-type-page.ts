import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { Reveal } from '../../shared/reveal';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { clampField, DEFAULT_RANGE, DEFAULT_SCALE, FluidRange, FluidRangeKey, FluidScale, FluidScaleKey, fluidClamp, NumberField, parseNumbers, RANGE_FIELDS, SCALE_FIELDS, SCALE_RATIOS, SCALE_STEPS, scaleRange, serializeNumbers, sizeAt, stepName } from './fluid-type';

const PREVIEW = { min: 320, max: 1920, step: 10, initial: 800 };

const readRange = (): FluidRange => {
  const values = parseNumbers(readQueryParam('range'), 5);
  if (!values) {
    return DEFAULT_RANGE;
  }
  const [minSize, maxSize, minViewport, maxViewport, root] = RANGE_FIELDS.map((field, index) =>
    clampField(field, values[index]),
  );
  return { minSize, maxSize, minViewport, maxViewport, root };
};

const readScale = (): FluidScale => {
  const values = parseNumbers(readQueryParam('scale'), 4);
  if (!values) {
    return DEFAULT_SCALE;
  }
  const [minBase, maxBase] = SCALE_FIELDS.map((field, index) => clampField(field, values[index]));
  const ratio = (value: number): number =>
    SCALE_RATIOS.find((item) => item.value === value)?.value ?? DEFAULT_SCALE.minRatio;
  return { minBase, maxBase, minRatio: ratio(values[2]), maxRatio: ratio(values[3]) };
};

const sameValues = (a: object, b: object): boolean => JSON.stringify(a) === JSON.stringify(b);

@Component({
  selector: 'app-fluid-type-page',
  imports: [CodeBlock, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fluid-type-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './fluid-type-page.scss'],
})
export class FluidTypePage {
  protected readonly range = signal(readRange());
  protected readonly scale = signal(readScale());
  protected readonly previewWidth = signal(PREVIEW.initial);

  protected readonly rangeFields = RANGE_FIELDS;
  protected readonly scaleFields = SCALE_FIELDS;
  protected readonly ratios = SCALE_RATIOS;
  protected readonly preview = PREVIEW;

  protected readonly value = computed(() => fluidClamp(this.range()));
  protected readonly code = computed(() => `.element {\n  font-size: ${this.value()};\n}`);
  protected readonly previewSize = computed(() => sizeAt(this.range(), this.previewWidth()));
  protected readonly steps = computed(() =>
    SCALE_STEPS.map((step) => {
      const range = scaleRange(this.scale(), this.range(), step);
      return {
        step,
        name: stepName(step),
        value: fluidClamp(range),
        minSize: range.minSize,
        maxSize: range.maxSize,
        previewSize: sizeAt(range, this.previewWidth()),
      };
    }),
  );
  protected readonly scaleCode = computed(
    () =>
      `:root {\n${this.steps()
        .map((step) => `  ${step.name}: ${step.value};`)
        .join('\n')}\n}`,
  );

  constructor() {
    syncQueryParams(() => ({
      range: sameValues(this.range(), DEFAULT_RANGE) ? undefined : serializeNumbers(Object.values(this.range())),
      scale: sameValues(this.scale(), DEFAULT_SCALE) ? undefined : serializeNumbers(Object.values(this.scale())),
    }));
  }

  protected setRange(field: NumberField<FluidRangeKey>, event: Event): void {
    const value = this.numberFrom(event, field);
    if (value !== undefined) {
      this.range.update((range) => ({ ...range, [field.key]: value }));
    }
  }

  protected setScale(field: NumberField<FluidScaleKey>, event: Event): void {
    const value = this.numberFrom(event, field);
    if (value !== undefined) {
      this.scale.update((scale) => ({ ...scale, [field.key]: value }));
    }
  }

  protected setRatio(key: 'minRatio' | 'maxRatio', event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const value = Number(event.target.value);
      this.scale.update((scale) => ({ ...scale, [key]: value }));
    }
  }

  protected setPreviewWidth(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.previewWidth.set(event.target.valueAsNumber);
    }
  }

  private numberFrom<Key extends string>(event: Event, field: NumberField<Key>): number | undefined {
    if (!(event.target instanceof HTMLInputElement)) {
      return undefined;
    }
    const input = event.target;
    const value = Number.isFinite(input.valueAsNumber) ? clampField(field, input.valueAsNumber) : undefined;
    if (value !== undefined) {
      input.value = String(value);
    }
    return value;
  }
}
