import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { arrowMove, dragIndexOf, DragPoint, PointerDrag } from '../../shared/pointer-drag';
import { Reveal } from '../../shared/reveal';
import { readQueryParam, syncQueryParams } from '../../shared/url-query';
import { CLIP_PRESETS, ClipPoint, ClipPreset, clampPercent, DEFAULT_POINTS, formatPolygon, MIN_POINTS, nearestEdge, outlinePoints, parseShape, sameShape, serializeShape } from './clip-path';

const QUERY_KEY = 'shape';
const SMALL_STEP = 1;
const LARGE_STEP = 10;

const PRESETS = CLIP_PRESETS.map((preset) => ({ ...preset, polygon: formatPolygon(preset.points) }));

@Component({
  selector: 'app-clip-path-page',
  imports: [CodeBlock, PointerDrag, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clip-path-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/tool-page.scss', './clip-path-page.scss'],
})
export class ClipPathPage {
  protected readonly shape = signal<readonly ClipPoint[]>(parseShape(readQueryParam(QUERY_KEY)) ?? DEFAULT_POINTS);
  protected readonly selectedId = signal(0);

  protected readonly presets = PRESETS;
  protected readonly minPoints = MIN_POINTS;

  protected readonly polygon = computed(() => formatPolygon(this.shape()));
  protected readonly outline = computed(() => outlinePoints(this.shape()));
  protected readonly code = computed(() => `.element {\n  clip-path: ${this.polygon()};\n}`);
  protected readonly match = computed(() => CLIP_PRESETS.find((preset) => sameShape(preset.points, this.shape())));
  protected readonly selected = computed<ClipPoint>(
    () => this.shape().find((point) => point.id === this.selectedId()) ?? this.shape()[0],
  );

  private draggingId?: number;

  constructor() {
    syncQueryParams(() => ({
      [QUERY_KEY]: sameShape(this.shape(), DEFAULT_POINTS) ? undefined : serializeShape(this.shape()),
    }));
  }

  protected load(preset: ClipPreset): void {
    this.shape.set(preset.points);
    this.selectedId.set(preset.points[0].id);
  }

  protected startDrag(point: DragPoint): void {
    const id = dragIndexOf(point.target) ?? this.addPoint(this.percentOf(point));
    this.draggingId = id;
    this.selectedId.set(id);
  }

  protected drag(point: DragPoint): void {
    if (this.draggingId !== undefined) {
      this.movePoint(this.draggingId, this.percentOf(point));
    }
  }

  protected endDrag(): void {
    this.draggingId = undefined;
  }

  protected pointKey(event: KeyboardEvent, point: ClipPoint): void {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.removePoint(point.id);
      return;
    }
    const move = arrowMove(event, SMALL_STEP, LARGE_STEP);
    if (move) {
      this.movePoint(point.id, { x: point.x + move.x, y: point.y + move.y });
    }
  }

  protected setCoordinate(axis: 'x' | 'y', event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const point = this.selected();
    if (Number.isFinite(event.target.valueAsNumber)) {
      this.movePoint(point.id, { ...point, [axis]: event.target.valueAsNumber });
    }
    event.target.value = String(this.selected()[axis]);
  }

  protected removePoint(id: number): void {
    if (this.shape().length <= MIN_POINTS) {
      return;
    }
    const remaining = this.shape().filter((point) => point.id !== id);
    this.shape.set(remaining);
    this.selectedId.set(remaining[0].id);
  }

  private addPoint(position: { readonly x: number; readonly y: number }): number {
    const shape = this.shape();
    const id = Math.max(...shape.map((point) => point.id)) + 1;
    const after = nearestEdge(shape, position);
    this.shape.set([...shape.slice(0, after + 1), { id, ...position }, ...shape.slice(after + 1)]);
    return id;
  }

  private movePoint(id: number, position: { readonly x: number; readonly y: number }): void {
    const x = clampPercent(position.x);
    const y = clampPercent(position.y);
    this.shape.update((shape) => shape.map((point) => (point.id === id ? { ...point, x, y } : point)));
  }

  private percentOf(point: DragPoint): { readonly x: number; readonly y: number } {
    return { x: clampPercent(point.x * 100), y: clampPercent(point.y * 100) };
  }
}
