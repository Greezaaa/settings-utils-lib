import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, PLATFORM_ID, signal } from '@angular/core';
import { SiteMotion } from '../../../core/site-motion';
import { CodeTab, CodeTabs } from '../../../shared/code-tabs';
import { formatRgb, hexToRgb } from '../../../shared/color';

type ClockMode = 'hours' | 'minutes' | 'seconds';

interface ClockColors {
  readonly first: string;
  readonly last: string;
  readonly hourShade: string;
  readonly secondShade: string;
}

const MODES: readonly { readonly value: ClockMode; readonly label: string }[] = [
  { value: 'hours', label: 'Hours' },
  { value: 'minutes', label: 'Hours + minutes' },
  { value: 'seconds', label: 'Hours + minutes + seconds' },
];

const TICK_MS = 1000;
const HOUR_SHADE_ALPHA = 0.6;
const SECOND_SHADE_ALPHA = 0.7;
const black = { r: 0, g: 0, b: 0 };

const ANGLES: Readonly<Record<ClockMode, readonly string[]>> = {
  hours: ['--hour-angle: calc((var(--hours) + var(--minutes) / 60) * 30deg);'],
  minutes: [
    '--hour-angle: calc((var(--hours) + var(--minutes) / 60) * 30deg);',
    '--minute-angle: calc(var(--minutes) * 6deg);',
  ],
  seconds: [
    '--hour-angle: calc((var(--hours) + var(--minutes) / 60) * 30deg);',
    '--minute-angle: calc(var(--minutes) * 6deg);',
    '--second-angle: calc(var(--seconds) * 6deg);',
  ],
};

const clockLayers = (mode: ClockMode, colors: ClockColors): readonly string[] => {
  const seconds = `conic-gradient(from var(--second-angle), transparent 75%, ${colors.secondShade})`;
  const hourShade = `conic-gradient(from var(--hour-angle), transparent, ${colors.hourShade})`;
  const minuteSweep = `conic-gradient(from var(--minute-angle), ${colors.first}, ${colors.last})`;
  const hourSweep = `conic-gradient(from var(--hour-angle), ${colors.first}, ${colors.last})`;
  const layers: Readonly<Record<ClockMode, readonly string[]>> = {
    hours: [hourSweep],
    minutes: [hourShade, minuteSweep],
    seconds: [seconds, hourShade, minuteSweep],
  };
  return layers[mode];
};

const background = (layers: readonly string[], indent: string): string =>
  layers.length === 1 ? ` ${layers[0]};` : `\n${layers.map((layer) => `${indent}${layer}`).join(',\n')};`;

const clockCss = (mode: ClockMode, colors: ClockColors): string => {
  const rule = `.clock {
${ANGLES[mode].map((angle) => `  ${angle}`).join('\n')}
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  background:${background(clockLayers(mode, colors), '    ')}
}`;
  if (mode !== 'seconds') {
    return rule;
  }
  return `${rule}

@media (prefers-reduced-motion: reduce) {
  .clock {
    background:${background(clockLayers('minutes', colors), '      ')}
  }
}`;
};

const clockJs = (mode: ClockMode): string => `const clock = document.querySelector('.clock');

const tick = () => {
  const now = new Date();
  clock.style.setProperty('--hours', now.getHours() % 12);
  clock.style.setProperty('--minutes', now.getMinutes());${
    mode === 'seconds' ? `\n  clock.style.setProperty('--seconds', now.getSeconds());` : ''
  }
  clock.setAttribute('aria-label', \`Clock showing \${now.toLocaleTimeString([], { timeStyle: 'short' })}\`);
};

tick();
setInterval(tick, 1000);`;

const CLOCK_HTML = `<div class="clock" role="img" aria-label="Clock"></div>`;

const pad = (value: number): string => String(value).padStart(2, '0');

@Component({
  selector: 'app-gradient-clock',
  imports: [CodeTabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gradient-clock.html',
  styleUrl: './gradient-clock.scss',
})
export class GradientClock {
  readonly first = input.required<string>();
  readonly last = input.required<string>();

  private readonly now = signal(new Date());

  protected readonly modes = MODES;
  protected readonly mode = signal<ClockMode>('minutes');
  protected readonly secondsAllowed = signal(false);

  protected readonly hours = computed(() => this.now().getHours() % 12);
  protected readonly minutes = computed(() => this.now().getMinutes());
  protected readonly seconds = computed(() => this.now().getSeconds());
  protected readonly time = computed(() => {
    const now = this.now();
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return this.mode() === 'seconds' ? `${time}:${pad(now.getSeconds())}` : time;
  });
  private readonly colors = computed<ClockColors>(() => ({
    first: this.first(),
    last: this.last(),
    hourShade: formatRgb(hexToRgb(this.first()) ?? black, HOUR_SHADE_ALPHA),
    secondShade: formatRgb(hexToRgb(this.last()) ?? black, SECOND_SHADE_ALPHA),
  }));
  protected readonly background = computed(() => clockLayers(this.mode(), this.colors()).join(', '));
  protected readonly code = computed<readonly CodeTab[]>(() => [
    { label: 'CSS', code: clockCss(this.mode(), this.colors()) },
    { label: 'HTML', code: CLOCK_HTML },
    { label: 'JavaScript', code: clockJs(this.mode()) },
  ]);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    this.secondsAllowed.set(!inject(SiteMotion).shouldReduce());
    const timer = setInterval(() => {
      const now = new Date();
      if (this.mode() === 'seconds' || now.getMinutes() !== this.now().getMinutes()) {
        this.now.set(now);
      }
    }, TICK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected isDisabled(mode: ClockMode): boolean {
    return mode === 'seconds' && !this.secondsAllowed();
  }

  protected choose(mode: ClockMode): void {
    this.now.set(new Date());
    this.mode.set(mode);
  }
}
