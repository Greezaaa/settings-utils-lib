import { ChangeDetectionStrategy, Component, computed, ElementRef, input, model, output, viewChild } from '@angular/core';
import { arrowMove, dragIndexOf, DragPoint, PointerDrag } from '../../../shared/pointer-drag';
import { BEZIER_Y_MAX, BEZIER_Y_MIN, BezierCurve, BezierHandle, curvePath, formatNumber, handlePoint, withHandle } from '../cubic-bezier';

const SCALE = 100;
const PADDING = 8;
const VIEW_LEFT = -PADDING;
const VIEW_WIDTH = SCALE + PADDING * 2;
const VIEW_HEIGHT = (BEZIER_Y_MAX - BEZIER_Y_MIN) * SCALE;
const SMALL_STEP = 0.01;
const LARGE_STEP = 0.1;
const GRID_STEPS = [0.25, 0.5, 0.75];

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
  imports: [PointerDrag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bezier-graph.html',
  styleUrl: './bezier-graph.scss',
})
export class BezierGraph {
  readonly curve = model.required<BezierCurve>();
  readonly compare = input<BezierCurve>();
  readonly settled = output();

  private readonly svg = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private dragging: BezierHandle = 0;

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

  protected startDrag(point: DragPoint): void {
    const grabbed = dragIndexOf(point.target);
    const position = this.positionOf(point);
    this.dragging = grabbed === 1 || (grabbed === undefined && this.nearestHandle(position) === 1) ? 1 : 0;
    this.svg()
      .nativeElement.querySelector<SVGGElement>(`[data-drag-index="${this.dragging}"]`)
      ?.focus({ preventScroll: true });
    if (grabbed === undefined) {
      this.moveHandle(this.dragging, position.x, position.y);
    }
  }

  protected drag(point: DragPoint): void {
    const position = this.positionOf(point);
    this.moveHandle(this.dragging, position.x, position.y);
  }

  protected nudge(event: KeyboardEvent, handle: BezierHandle): void {
    const move = arrowMove(event, SMALL_STEP, LARGE_STEP);
    if (move) {
      const { x, y } = handlePoint(this.curve(), handle);
      this.moveHandle(handle, x + move.x, y - move.y);
    }
  }

  private moveHandle(handle: BezierHandle, x: number, y: number): void {
    this.curve.update((curve) => withHandle(curve, handle, roundToStep(x), roundToStep(y)));
  }

  private positionOf(point: DragPoint): { readonly x: number; readonly y: number } {
    return {
      x: (VIEW_LEFT + point.x * VIEW_WIDTH) / SCALE,
      y: BEZIER_Y_MAX - (point.y * VIEW_HEIGHT) / SCALE,
    };
  }

  private nearestHandle(position: { readonly x: number; readonly y: number }): BezierHandle {
    const distance = (handle: BezierHandle): number => {
      const { x, y } = handlePoint(this.curve(), handle);
      return Math.hypot(x - position.x, y - position.y);
    };
    return distance(0) <= distance(1) ? 0 : 1;
  }
}
