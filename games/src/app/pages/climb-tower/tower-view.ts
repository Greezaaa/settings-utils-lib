import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** The drawing's size, the height between floors, and where the climber's floor stays on screen */
const WIDTH = 300;
const HEIGHT = 420;
const FLOOR_GAP = 100;
const STAND_Y = 340;
const PLATFORM_WIDTH = 90;
/** How far the climber drops when falling, past the bottom of the drawing */
const FALL_DISTANCE = 520;

/** A platform to draw: its floor, where its middle is, and a label above it (Which one's equations) */
export interface TowerPlatform {
  readonly floor: number;
  readonly x: number;
  readonly label?: string;
}

/**
 * The tower: platforms one floor apart and a stick climber on the current one. Climbing moves the climber up onto the
 * next platform, then the whole tower scrolls down so the new floor sits where the old one was; falling drops the
 * climber off the bottom. The movements are CSS transitions on the drawing's groups.
 */
@Component({
  selector: 'app-tower-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tower-view.html',
  styleUrl: './tower-view.scss',
})
export class TowerView {
  /** The floor the climber stands on (0 is the ground) */
  readonly floor = input.required<number>();
  readonly platforms = input.required<readonly TowerPlatform[]>();
  /** Where the climber is: on the current floor's platform, or heading to a platform it misses */
  readonly climberX = input.required<number>();
  readonly isFalling = input(false);

  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
  protected readonly ground = { x: 0, width: WIDTH };
  protected readonly platformWidth = PLATFORM_WIDTH;

  /** The tower scrolls so the current floor stays at the same height on screen */
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
