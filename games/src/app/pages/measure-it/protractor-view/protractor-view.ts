import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';

const CX = 120;
const CY = 120;
const RADIUS = 100;

function pointAt(degrees: number, radius: number): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(radians),
    y: CY - radius * Math.sin(radians),
  };
}

const MAX_ANGLE = 180;

const KEY_STEPS: Readonly<Record<string, number>> = {
  ArrowUp: 1,
  ArrowLeft: 1,
  ArrowDown: -1,
  ArrowRight: -1,
  PageUp: 10,
  PageDown: -10,
};

const clampAngle = (degrees: number): number => Math.min(MAX_ANGLE, Math.max(0, Math.round(degrees)));

export interface CheckedRay {
  readonly angle: number;
  readonly isRight: boolean;
}

@Component({
  selector: 'app-protractor-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './protractor-view.html',
  styleUrl: '../measure-views.scss',
})
export class ProtractorView {
  readonly angle = input.required<number>();
  readonly marksEvery = input(10);
  readonly labels = input(true);
  readonly checked = input<CheckedRay | null>(null);
  readonly editable = input(false);
  readonly label = input('');
  readonly angleChange = output<number>();

  private readonly drawing = viewChild.required<ElementRef<SVGSVGElement>>('drawing');
  private readonly pointerId = signal<number | null>(null);

  protected readonly arc = `M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`;
  protected readonly baseline = {
    x1: CX - RADIUS - 8,
    x2: CX + RADIUS + 8,
    y: CY,
  };
  protected readonly center = { x: CX, y: CY };

  protected readonly marks = computed(() => {
    const every = this.marksEvery();
    if (every <= 0) {
      return [];
    }
    return Array.from({ length: Math.floor(180 / every) + 1 }, (_, index) => {
      const degrees = index * every;
      const outer = pointAt(degrees, RADIUS);
      const inner = pointAt(degrees, RADIUS - (degrees % 30 === 0 ? 10 : 6));
      const label = pointAt(degrees, RADIUS - 20);
      return { degrees, outer, inner, label };
    });
  });

  protected readonly ray = computed(() => pointAt(this.angle(), RADIUS + 6));
  protected readonly knob = computed(() => pointAt(this.angle(), RADIUS));
  protected readonly checkedRay = computed(() => {
    const checked = this.checked();
    return (
      checked && {
        ...pointAt(checked.angle, RADIUS + 6),
        isRight: checked.isRight,
      }
    );
  });
  protected readonly angleArc = computed(() => {
    const end = pointAt(this.angle(), 26);
    return `M ${CX + 26} ${CY} A 26 26 0 0 0 ${end.x} ${end.y}`;
  });

  protected onPointerDown(event: PointerEvent): void {
    if (!this.editable() || !event.isPrimary) {
      return;
    }
    this.drawing().nativeElement.setPointerCapture(event.pointerId);
    this.pointerId.set(event.pointerId);
    this.turnTo(event);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.pointerId() === event.pointerId) {
      this.turnTo(event);
    }
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerId() === event.pointerId) {
      this.pointerId.set(null);
    }
  }

  protected onKey(event: KeyboardEvent): void {
    if (!this.editable()) {
      return;
    }
    const change = KEY_STEPS[event.key];
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? MAX_ANGLE : null;
    if (change === undefined && target === null) {
      return;
    }
    event.preventDefault();
    this.angleChange.emit(clampAngle(target ?? this.angle() + change));
  }

  private turnTo(event: PointerEvent): void {
    const svg = this.drawing().nativeElement;
    const matrix = svg.getScreenCTM();
    if (!matrix) {
      return;
    }
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const below = point.y > CY;
    const degrees = below ? (point.x < CX ? MAX_ANGLE : 0) : (Math.atan2(CY - point.y, point.x - CX) * 180) / Math.PI;
    this.angleChange.emit(clampAngle(degrees));
  }
}
