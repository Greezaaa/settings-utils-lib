import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const WIDTH = 300;
const HEIGHT = 420;
const FLOOR_GAP = 100;
const STAND_Y = 340;
const PLATFORM_WIDTH = 90;
const FALL_DISTANCE = 520;

export interface TowerPlatform {
  readonly floor: number;
  readonly x: number;
  readonly label?: string;
}

@Component({
  selector: 'app-tower-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tower-view.html',
  styleUrl: './tower-view.scss',
})
export class TowerView {
  readonly floor = input.required<number>();
  readonly platforms = input.required<readonly TowerPlatform[]>();
  readonly climberX = input.required<number>();
  readonly isFalling = input(false);

  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
  protected readonly ground = { x: 0, width: WIDTH };
  protected readonly platformWidth = PLATFORM_WIDTH;

  protected readonly worldTransform = computed(() => `translate(0px, ${STAND_Y + this.floor() * FLOOR_GAP}px)`);
  protected readonly climberTransform = computed(() => {
    const y = -this.floor() * FLOOR_GAP;
    return this.isFalling()
      ? `translate(${this.climberX()}px, ${y + FALL_DISTANCE}px) rotate(80deg)`
      : `translate(${this.climberX()}px, ${y}px)`;
  });
  protected readonly drawn = computed(() =>
    this.platforms().map((platform) => ({ ...platform, y: -platform.floor * FLOOR_GAP })),
  );
}
