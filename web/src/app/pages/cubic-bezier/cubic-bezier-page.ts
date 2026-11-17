import { afterNextRender, ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { CodeTab, CodeTabs } from '../../shared/code-tabs';
import { EasingPreview, PreviewLane } from '../../shared/easing-preview/easing-preview';
import { Reveal } from '../../shared/reveal';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { BezierGraph } from './bezier-graph/bezier-graph';
import { BEZIER_PRESETS, BEZIER_Y_MAX, BEZIER_Y_MIN, BezierCurve, BezierPreset, curvePath, DEFAULT_CURVE, easeAt, findPreset, formatCurve, formatNumber, parseCurve, sameCurve, serializeCurve, withCoordinate } from './cubic-bezier';

const QUERY_KEY = 'curve';
const NO_COMPARE = 'none';

const COORDINATES = [
  { index: 0, label: 'x1', min: 0, max: 1 },
  { index: 1, label: 'y1', min: BEZIER_Y_MIN, max: BEZIER_Y_MAX },
  { index: 2, label: 'x2', min: 0, max: 1 },
  { index: 3, label: 'y2', min: BEZIER_Y_MIN, max: BEZIER_Y_MAX },
] as const;

const DURATION = { min: 200, max: 3000, step: 100, initial: 800 };

const thumbnailPoint = (x: number, y: number): string => `${6 + x * 28} ${30 - y * 20}`;

const EXAMPLES = BEZIER_PRESETS.map((preset) => ({
  ...preset,
  thumbnail: curvePath(preset.curve, thumbnailPoint),
  value: preset.curve.map(formatNumber).join(', '),
}));

const snippets = (value: string, duration: number): readonly CodeTab[] => [
  {
    label: 'Transition',
    code: `.element {
  transition-property: transform;
  transition-duration: ${duration}ms;
  transition-timing-function: ${value};
}`,
  },
  {
    label: 'Animation',
    code: `.element {
  animation-name: slide-in;
  animation-duration: ${duration}ms;
  animation-timing-function: ${value};
}`,
  },
  {
    label: 'JavaScript',
    code: `element.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], {
  duration: ${duration},
  easing: '${value}',
});`,
  },
];

const bezierLane = (label: string, curve: BezierCurve): PreviewLane => ({
  label,
  ease: (progress) => easeAt(curve, progress),
});

@Component({
  selector: 'app-cubic-bezier-page',
  imports: [BezierGraph, CodeBlock, CodeTabs, EasingPreview, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cubic-bezier-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './cubic-bezier-page.scss'],
})
export class CubicBezierPage {
  private readonly preview = viewChild.required(EasingPreview);

  protected readonly curve = signal<BezierCurve>(parseCurve(readQueryParam(QUERY_KEY)) ?? DEFAULT_CURVE);
  protected readonly compareKey = signal('linear');
  protected readonly duration = signal(DURATION.initial);

  protected readonly coordinates = COORDINATES;
  protected readonly durationRange = DURATION;
  protected readonly examples = EXAMPLES;
  protected readonly presets = BEZIER_PRESETS;
  protected readonly noCompare = NO_COMPARE;

  protected readonly value = computed(() => formatCurve(this.curve()));
  protected readonly match = computed(() => findPreset(this.curve()));
  protected readonly compare = computed(() => BEZIER_PRESETS.find((preset) => preset.key === this.compareKey()));
  protected readonly lanes = computed<readonly PreviewLane[]>(() => {
    const compare = this.compare();
    const own = bezierLane(`Yours · ${this.value()}`, this.curve());
    return compare ? [own, bezierLane(compare.name, compare.curve)] : [own];
  });
  protected readonly snippets = computed(() => snippets(this.value(), this.duration()));

  constructor() {
    syncQueryParams(() => ({
      [QUERY_KEY]: sameCurve(this.curve(), DEFAULT_CURVE) ? undefined : serializeCurve(this.curve()),
    }));
    afterNextRender(() => this.autoplay());
  }

  protected load(preset: BezierPreset): void {
    this.curve.set(preset.curve);
    this.autoplay();
  }

  protected setCoordinate(index: number, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const input = event.target;
    if (Number.isFinite(input.valueAsNumber)) {
      this.curve.update((curve) => withCoordinate(curve, index, input.valueAsNumber));
    }
    input.value = formatNumber(this.curve()[index]);
  }

  protected chooseCompare(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.compareKey.set(event.target.value);
    }
  }

  protected setDuration(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.duration.set(event.target.valueAsNumber);
    }
  }

  protected autoplay(): void {
    this.preview().autoplay();
  }
}
