import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

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
}
