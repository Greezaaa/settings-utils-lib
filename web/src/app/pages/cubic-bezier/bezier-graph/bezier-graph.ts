import { ChangeDetectionStrategy, Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { BEZIER_Y_MAX, BEZIER_Y_MIN, BezierCurve, BezierHandle, curvePath, formatNumber, handlePoint, withHandle } from '../cubic-bezier';

const SCALE = 100;
const PADDING = 8;
const VIEW_LEFT = -PADDING;
const VIEW_WIDTH = SCALE + PADDING * 2;
const VIEW_HEIGHT = (BEZIER_Y_MAX - BEZIER_Y_MIN) * SCALE;
const SMALL_STEP = 0.01;
const LARGE_STEP = 0.1;
const GRID_STEPS = [0.25, 0.5, 0.75];

const KEY_MOVES: Readonly<Record<string, { readonly x: number; readonly y: number }>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: -1 },
};

const toSvgX = (x: number): number => x * SCALE;
const toSvgY = (y: number): number => (BEZIER_Y_MAX - y) * SCALE;
const toSvgPoint = (x: number, y: number): string => `${toSvgX(x)} ${toSvgY(y)}`;
const roundToStep = (value: number): number => Math.round(value / SMALL_STEP) * SMALL_STEP;

interface GraphHandle {
  readonly index: BezierHandle;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly anchorX: number;
  readonly anchorY: number;
  readonly valueText: string;
}

@Component({
  selector: 'app-bezier-graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bezier-graph.html',
  styleUrl: './bezier-graph.scss',
})
export class BezierGraph {
  readonly curve = model.required<BezierCurve>();
  readonly compare = input<BezierCurve>();
  readonly settled = output();

  protected readonly viewBox = `${VIEW_LEFT} 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`;
  protected readonly yMin = BEZIER_Y_MIN;
  protected readonly yMax = BEZIER_Y_MAX;
  protected readonly unit = { x: toSvgX(0), y: toSvgY(1), size: SCALE };
  protected readonly view = { left: VIEW_LEFT, width: VIEW_WIDTH, height: VIEW_HEIGHT };
  protected readonly gridLines = GRID_STEPS.map((step) => ({ x: toSvgX(step), y: toSvgY(step) }));
  protected readonly start = { x: toSvgX(0), y: toSvgY(0) };
  protected readonly end = { x: toSvgX(1), y: toSvgY(1) };

  protected readonly path = computed(() => curvePath(this.curve(), toSvgPoint));
  protected readonly comparePath = computed(() => {
    const compare = this.compare();
    return compare ? curvePath(compare, toSvgPoint) : undefined;
  });
  protected readonly handles = computed<readonly GraphHandle[]>(() =>
    ([0, 1] as const).map((index) => {
      const { x, y } = handlePoint(this.curve(), index);
      const anchor = index === 0 ? this.start : this.end;
      return {
        index,
        label: index === 0 ? 'First control point (x1, y1)' : 'Second control point (x2, y2)',
        x: toSvgX(x),
        y: toSvgY(y),
        anchorX: anchor.x,
        anchorY: anchor.y,
        valueText: `x ${formatNumber(x)}, y ${formatNumber(y)}`,
      };
    }),
  );

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private dragging?: BezierHandle;

  protected startDrag(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const svg = this.svg().nativeElement;
    const point = this.pointFrom(event);
    const handle = this.handleFrom(event) ?? this.nearestHandle(point);
    this.dragging = handle;
    svg.setPointerCapture(event.pointerId);
    svg.querySelector<SVGGElement>(`[data-handle="${handle}"]`)?.focus({ preventScroll: true });
    if (this.handleFrom(event) === undefined) {
      this.moveHandle(handle, point.x, point.y);
    }
  }

  protected drag(event: PointerEvent): void {
    if (this.dragging === undefined) {
      return;
    }
    const point = this.pointFrom(event);
    this.moveHandle(this.dragging, point.x, point.y);
  }

  protected endDrag(event: PointerEvent): void {
    if (this.dragging === undefined) {
      return;
    }
    this.dragging = undefined;
    const svg = this.svg().nativeElement;
    if (svg.hasPointerCapture(event.pointerId)) {
      svg.releasePointerCapture(event.pointerId);
    }
    this.settled.emit();
  }

  protected nudge(event: KeyboardEvent, handle: BezierHandle): void {
    const move = KEY_MOVES[event.key];
    if (!move) {
      return;
    }
    event.preventDefault();
    const step = event.shiftKey ? LARGE_STEP : SMALL_STEP;
    const { x, y } = handlePoint(this.curve(), handle);
    this.moveHandle(handle, x + move.x * step, y + move.y * step);
  }

  private moveHandle(handle: BezierHandle, x: number, y: number): void {
    this.curve.update((curve) => withHandle(curve, handle, roundToStep(x), roundToStep(y)));
  }

  private pointFrom(event: PointerEvent): { readonly x: number; readonly y: number } {
    const rect = this.svg().nativeElement.getBoundingClientRect();
    const svgX = VIEW_LEFT + ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    const svgY = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
    return { x: svgX / SCALE, y: BEZIER_Y_MAX - svgY / SCALE };
  }

  private handleFrom(event: PointerEvent): BezierHandle | undefined {
    const element = event.target instanceof Element ? event.target.closest('[data-handle]') : null;
    const value = element?.getAttribute('data-handle');
    if (value === '0') {
      return 0;
    }
    return value === '1' ? 1 : undefined;
  }

  private nearestHandle(point: { readonly x: number; readonly y: number }): BezierHandle {
    const distance = (handle: BezierHandle): number => {
      const { x, y } = handlePoint(this.curve(), handle);
      return Math.hypot(x - point.x, y - point.y);
    };
    return distance(0) <= distance(1) ? 0 : 1;
  }
}
