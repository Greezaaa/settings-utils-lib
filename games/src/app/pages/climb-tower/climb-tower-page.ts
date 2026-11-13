import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { readStored, writeStored } from '../../core/site-storage';
import { CLIMB_MODE_IDS, ClimbModeId, ClimbStep, climbStep, Side, SIDES } from '../../games/climb-tower';
import { formatExpression, formatQuestion, formatSolution, getLevel, isTrue, LEVELS, LevelId } from '../../games/math-games';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { TowerPlatform, TowerView } from './tower-view/tower-view';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'ready' | 'playing' | 'over';

type BestKey = `${ClimbModeId}:${LevelId}`;
type BestFloors = Partial<Record<BestKey, number>>;
const BEST_STORAGE = RESULT_GAMES['climb-tower'].storage;

const JUMP_MS = 800;
const FALL_MS = 1100;

const ZIGZAG = [150, 80, 210, 120, 230, 70, 180] as const;
const zigzagX = (floor: number): number => ZIGZAG[floor % ZIGZAG.length];
const SIDE_X: Readonly<Record<Side, number>> = { left: 80, right: 220 };
const FLOORS_BELOW = 3;

const ANSWER_KEYS: Readonly<Record<string, Side>> = { ArrowLeft: 'left', ArrowRight: 'right' };

@Component({
  selector: 'app-climb-tower-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, RouterLink, TowerView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './climb-tower-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './climb-tower-page.scss'],
  host: { '(document:keydown)': 'onKey($event)' },
})
export class ClimbTowerPage {
  protected readonly modes = CLIMB_MODE_IDS;
  protected readonly levels = LEVELS.map(({ id }) => id);
  protected readonly sides = SIDES;
  protected readonly minAge = gameInfo('climb-tower').minAge;
  private readonly api = inject(GamesApi);
  private readonly account = inject(PlayerAccount);
  protected readonly formatExpression = formatExpression;

  protected readonly modeId = signal<ClimbModeId>('true-or-false');
  protected readonly levelId = signal<LevelId>('easy');
  protected readonly phase = signal<Phase>('ready');

  protected readonly floor = signal(0);
  private readonly path = signal<readonly number[]>([zigzagX(0)]);
  protected readonly step = signal<ClimbStep | null>(null);
  private readonly isMoving = signal(false);
  protected readonly isFalling = signal(false);
  private readonly missedX = signal<number | null>(null);

  protected readonly climberX = computed(() => this.missedX() ?? this.path()[this.floor()]);
  protected readonly platforms = computed<readonly TowerPlatform[]>(() => {
    const floor = this.floor();
    const below = this.path()
      .map((x, index) => ({ floor: index, x }))
      .slice(Math.max(0, floor - FLOORS_BELOW));
    const step = this.step();
    if (!step || this.isFalling()) {
      return below;
    }
    const next =
      step.kind === 'pick'
        ? SIDES.map((side) => ({ floor: floor + 1, x: SIDE_X[side], label: formatExpression(step.equations[side]) }))
        : [{ floor: floor + 1, x: zigzagX(floor + 1) }];
    return [...below, ...next];
  });
  protected readonly solution = signal('');

  private readonly bestFloors = signal<BestFloors>({});
  private readonly bestKey = computed<BestKey>(() => `${this.modeId()}:${this.levelId()}`);
  protected readonly best = computed(() => this.bestFloors()[this.bestKey()] ?? 0);
  protected readonly isNewBest = signal(false);

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    afterNextRender(() => this.bestFloors.set(readBestFloors()));
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected start(): void {
    clearTimeout(this.timer);
    this.api.countPlay('climb-tower');
    this.floor.set(0);
    this.path.set([zigzagX(0)]);
    this.isMoving.set(false);
    this.isFalling.set(false);
    this.missedX.set(null);
    this.isNewBest.set(false);
    this.phase.set('playing');
    this.nextStep();
  }

  protected backToSettings(): void {
    clearTimeout(this.timer);
    this.phase.set('ready');
  }

  protected judge(saysTrue: boolean): void {
    this.answer(saysTrue ? 'right' : 'left');
  }

  protected answer(side: Side): void {
    const step = this.step();
    if (!step || this.isMoving() || this.phase() !== 'playing') {
      return;
    }
    const isRight = step.kind === 'pick' ? side === step.rightSide : (side === 'right') === isTrue(step.question);
    const targetX = step.kind === 'pick' ? SIDE_X[side] : zigzagX(this.floor() + 1);
    this.isMoving.set(true);
    if (isRight) {
      this.climb(targetX);
    } else {
      this.fall(step, targetX);
    }
  }

  protected onKey(event: KeyboardEvent): void {
    const side = ANSWER_KEYS[event.key];
    if (side && this.phase() === 'playing') {
      event.preventDefault();
      this.answer(side);
    }
  }

  private climb(targetX: number): void {
    this.path.update((path) => [...path, targetX]);
    this.floor.update((floor) => floor + 1);
    this.step.set(null);
    this.timer = setTimeout(() => {
      this.isMoving.set(false);
      this.nextStep();
    }, JUMP_MS);
  }

  private fall(step: ClimbStep, targetX: number): void {
    this.solution.set(
      step.kind === 'pick' ? formatSolution(step.equations[step.rightSide]) : formatSolution(step.question),
    );
    this.missedX.set(targetX);
    this.isFalling.set(true);
    this.timer = setTimeout(() => this.finish(), FALL_MS);
  }

  private nextStep(): void {
    this.step.set(climbStep(this.modeId(), getLevel(this.levelId()), Math.random));
  }

  private finish(): void {
    this.phase.set('over');
    this.account.record('climb-tower', this.bestKey(), this.floor());
    if (this.floor() > this.best()) {
      this.isNewBest.set(true);
      this.bestFloors.update((floors) => ({ ...floors, [this.bestKey()]: this.floor() }));
      writeStored(BEST_STORAGE, this.bestFloors());
    }
  }

  protected equationOf(step: ClimbStep): string {
    return step.kind === 'judge' ? formatQuestion(step.question) : String(step.result);
  }
}

function readBestFloors(): BestFloors {
  const stored = readStored(BEST_STORAGE);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const floors: BestFloors = {};
  for (const mode of CLIMB_MODE_IDS) {
    for (const { id } of LEVELS) {
      const key: BestKey = `${mode}:${id}`;
      const value: unknown = Reflect.get(stored, key);
      if (typeof value === 'number' && Number.isFinite(value)) {
        floors[key] = value;
      }
    }
  }
  return floors;
}
