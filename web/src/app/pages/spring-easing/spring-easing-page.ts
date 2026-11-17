import { afterNextRender, ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { CodeTab, CodeTabs } from '../../shared/code-tabs';
import { EasingPreview, PreviewLane } from '../../shared/easing-preview/easing-preview';
import { Reveal } from '../../shared/reveal';
import { BezierCurve, easeAt } from '../cubic-bezier/cubic-bezier';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { clampSpring, DEFAULT_SPRING, formatLinear, parseSpring, restLine, sameSpring, serializeSpring, simulate, Spring, SPRING_FIELDS, SPRING_PRESETS, SpringKey, springEaseAt, springPath, SpringPreset } from './spring';

const QUERY_KEY = 'spring';
const GRAPH = { width: 320, height: 160 };
const COMPARE_CURVE: BezierCurve = [0, 0, 0.58, 1];
const COMPARE_LANE: PreviewLane = { label: 'ease-out', ease: (progress) => easeAt(COMPARE_CURVE, progress) };

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
  animation-name: pop-in;
  animation-duration: ${duration}ms;
  animation-timing-function: ${value};
}`,
  },
  {
    label: 'JavaScript',
    code: `element.animate([{ transform: 'scale(0.5)' }, { transform: 'scale(1)' }], {
  duration: ${duration},
  easing: '${value}',
});`,
  },
];

const PRESETS = SPRING_PRESETS.map((preset) => ({
  ...preset,
  thumbnail: springPath(simulate(preset.spring), 40, 40),
}));

@Component({
  selector: 'app-spring-easing-page',
  imports: [CodeTabs, EasingPreview, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spring-easing-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './spring-easing-page.scss'],
})
export class SpringEasingPage {
  private readonly preview = viewChild.required(EasingPreview);

  protected readonly spring = signal<Spring>(parseSpring(readQueryParam(QUERY_KEY)) ?? DEFAULT_SPRING);
  protected readonly compareWithEase = signal(true);

  protected readonly fields = SPRING_FIELDS;
  protected readonly presets = PRESETS;
  protected readonly graph = GRAPH;

  protected readonly motion = computed(() => simulate(this.spring()));
  protected readonly value = computed(() => formatLinear(this.motion()));
  protected readonly snippets = computed(() => snippets(this.value(), this.motion().duration));
  protected readonly path = computed(() => springPath(this.motion(), GRAPH.width, GRAPH.height));
  protected readonly rest = computed(() => restLine(this.motion(), GRAPH.height));
  protected readonly match = computed(() => SPRING_PRESETS.find((preset) => sameSpring(preset.spring, this.spring())));
  protected readonly lanes = computed<readonly PreviewLane[]>(() => {
    const motion = this.motion();
    const spring: PreviewLane = {
      label: `Spring · ${motion.duration} ms`,
      ease: (progress) => springEaseAt(motion, progress),
    };
    return this.compareWithEase() ? [spring, COMPARE_LANE] : [spring];
  });

  constructor() {
    syncQueryParams(() => ({
      [QUERY_KEY]: sameSpring(this.spring(), DEFAULT_SPRING) ? undefined : serializeSpring(this.spring()),
    }));
    afterNextRender(() => this.preview().autoplay());
  }

  protected setField(key: SpringKey, event: Event): void {
    if (event.target instanceof HTMLInputElement && Number.isFinite(event.target.valueAsNumber)) {
      const value = clampSpring(key, event.target.valueAsNumber);
      this.spring.update((spring) => ({ ...spring, [key]: value }));
    }
  }

  protected setCompare(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.compareWithEase.set(event.target.checked);
    }
  }

  protected load(preset: SpringPreset): void {
    this.spring.set(preset.spring);
    this.preview().autoplay();
  }
}
