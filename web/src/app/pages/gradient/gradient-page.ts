import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { ColorField } from '../../shared/color-field/color-field';
import { arrowMove, dragIndexOf, DragPoint, PointerDrag } from '../../shared/pointer-drag';
import { Reveal } from '../../shared/reveal';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { clampAngle, clampPosition, colorAt, DEFAULT_GRADIENT, describeStop, formatGradient, formatStripe, Gradient, GRADIENT_PRESETS, GradientPreset, GradientSpace, GradientStop, GradientType, parseGradient, renderable, sameGradient, serializeGradient, sortedStops, widestGapMiddle } from './gradient';

const QUERY_KEY = 'gradient';
const MIN_STOPS = 2;
const SMALL_STEP = 1;
const LARGE_STEP = 10;

const TYPES: readonly { readonly value: GradientType; readonly label: string }[] = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];

const SPACES: readonly { readonly value: GradientSpace; readonly label: string }[] = [
  { value: 'oklch', label: 'Smooth (oklch)' },
  { value: 'srgb', label: 'Classic (sRGB)' },
];

const PRESETS = GRADIENT_PRESETS.map((preset) => ({
  ...preset,
  background: renderable(preset.gradient, formatGradient),
}));

const snippet = (gradient: Gradient): string => {
  const value = formatGradient(gradient);
  const fallback =
    gradient.space === 'oklch' ? `  background: ${formatGradient({ ...gradient, space: 'srgb' })};\n` : '';
  return `.element {\n${fallback}  background: ${value};\n}`;
};

@Component({
  selector: 'app-gradient-page',
  imports: [CodeBlock, ColorField, PointerDrag, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gradient-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './gradient-page.scss'],
})
export class GradientPage {
  protected readonly gradient = signal<Gradient>(parseGradient(readQueryParam(QUERY_KEY)) ?? DEFAULT_GRADIENT);
  protected readonly selectedId = signal(0);

  protected readonly types = TYPES;
  protected readonly spaces = SPACES;
  protected readonly presets = PRESETS;
  protected readonly describeStop = describeStop;

  protected readonly value = computed(() => formatGradient(this.gradient()));
  protected readonly preview = computed(() => renderable(this.gradient(), formatGradient));
  protected readonly stripe = computed(() => renderable(this.gradient(), formatStripe));
  protected readonly stops = computed(() => sortedStops(this.gradient()));
  protected readonly canRemove = computed(() => this.gradient().stops.length > MIN_STOPS);
  protected readonly code = computed(() => snippet(this.gradient()));
  protected readonly match = computed(() =>
    GRADIENT_PRESETS.find((preset) => sameGradient(preset.gradient, this.gradient())),
  );
  protected readonly selected = computed<GradientStop>(
    () => this.gradient().stops.find((stop) => stop.id === this.selectedId()) ?? this.gradient().stops[0],
  );

  private draggingId?: number;

  constructor() {
    syncQueryParams(() => ({
      [QUERY_KEY]: sameGradient(this.gradient(), DEFAULT_GRADIENT) ? undefined : serializeGradient(this.gradient()),
    }));
  }

  protected setType(type: GradientType): void {
    this.gradient.update((gradient) => ({ ...gradient, type }));
  }

  protected setSpace(space: GradientSpace): void {
    this.gradient.update((gradient) => ({ ...gradient, space }));
  }

  protected setAngle(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const angle = clampAngle(event.target.valueAsNumber);
      this.gradient.update((gradient) => ({ ...gradient, angle }));
    }
  }

  protected load(preset: GradientPreset): void {
    this.gradient.set(preset.gradient);
    this.selectedId.set(preset.gradient.stops[0].id);
  }

  protected startDrag(point: DragPoint): void {
    const grabbed = dragIndexOf(point.target);
    const id = grabbed ?? this.addStop(clampPosition(point.x * 100));
    this.draggingId = id;
    this.selectedId.set(id);
  }

  protected drag(point: DragPoint): void {
    if (this.draggingId !== undefined) {
      this.updateStop(this.draggingId, { position: clampPosition(point.x * 100) });
    }
  }

  protected endDrag(): void {
    this.draggingId = undefined;
  }

  protected stopKey(event: KeyboardEvent, stop: GradientStop): void {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.removeStop(stop.id);
      return;
    }
    const move = arrowMove(event, SMALL_STEP, LARGE_STEP);
    if (move) {
      this.updateStop(stop.id, { position: clampPosition(stop.position + move.x - move.y) });
    }
  }

  protected setColor(id: number, color: string): void {
    this.selectedId.set(id);
    this.updateStop(id, { color });
  }

  protected setPosition(id: number, event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    if (Number.isFinite(event.target.valueAsNumber)) {
      this.updateStop(id, { position: clampPosition(event.target.valueAsNumber) });
    }
    event.target.value = String(this.gradient().stops.find((stop) => stop.id === id)?.position ?? 0);
  }

  protected addColor(): void {
    this.selectedId.set(this.addStop(widestGapMiddle(this.gradient())));
  }

  protected removeStop(id: number): void {
    const stops = this.gradient().stops;
    if (stops.length <= MIN_STOPS) {
      return;
    }
    const remaining = stops.filter((stop) => stop.id !== id);
    this.gradient.update((gradient) => ({ ...gradient, stops: remaining }));
    this.selectedId.set(remaining[0].id);
  }

  private addStop(position: number): number {
    const gradient = this.gradient();
    const id = Math.max(...gradient.stops.map((stop) => stop.id)) + 1;
    const stop = { id, position, color: colorAt(gradient, position) };
    this.gradient.set({ ...gradient, stops: [...gradient.stops, stop] });
    return id;
  }

  private updateStop(id: number, change: Partial<Omit<GradientStop, 'id'>>): void {
    this.gradient.update((gradient) => ({
      ...gradient,
      stops: gradient.stops.map((stop) => (stop.id === id ? { ...stop, ...change } : stop)),
    }));
  }
}
