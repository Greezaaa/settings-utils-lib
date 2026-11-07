import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { readStored, writeStored } from '../../core/site-storage';
import { BoardLevelId, cellCount } from '../../games/board';
import { getTurnLevel, isSolved, scramble, turn, TURN_LEVELS, TURN_MODE_IDS, TurnModeId, Turns } from '../../games/turn-picture';
import { SiteLanguage } from '../../i18n/site-language';
import { GameBoard } from '../../shared/game-board';
import { PictureSlice } from '../../shared/picture-slice';

/** Memory mode starts with the whole picture on show, until the player presses Ready */
type Phase = 'preview' | 'playing' | 'solved';

/** Best times are kept apart for each mode and level, e.g. `memory:hard` */
type ScoreKey = `${TurnModeId}:${BoardLevelId}`;
type BestSeconds = Partial<Record<ScoreKey, number>>;

const BEST_SECONDS_STORAGE = 'turn-picture:best-seconds';

const DEFAULT_LEVEL: BoardLevelId = 'normal';

/**
 * Turn the picture: tap squares to turn them a quarter clockwise until the drawing is right again.
 * Look mode keeps the drawing visible under the board; Memory mode shows it only until Ready.
 */
@Component({
  selector: 'app-turn-picture-page',
  imports: [GameBoard, PictureSlice, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './turn-picture-page.html',
  styleUrls: ['../../shared/utility-page.scss', './turn-picture-page.scss'],
})
export class TurnPicturePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  protected readonly modes = TURN_MODE_IDS;
  protected readonly levels = TURN_LEVELS;
  protected readonly modeId = signal<TurnModeId>('look');
  protected readonly levelId = signal<BoardLevelId>(DEFAULT_LEVEL);
  protected readonly level = computed(() => getTurnLevel(this.levelId()));

  /** Chosen in the browser only, so the prerendered page and the first render agree */
  protected readonly picture = signal<GamePicture | null>(null);
  protected readonly turns = signal<Turns>([]);
  protected readonly phase = signal<Phase>('playing');
  protected readonly taps = signal(0);
  protected readonly seconds = signal(0);
  protected readonly isNewBest = signal(false);

  private readonly bestSeconds = signal<BestSeconds>({});
  private readonly scoreKey = computed<ScoreKey>(() => `${this.modeId()}:${this.levelId()}`);
  protected readonly best = computed(() => {
    const seconds = this.bestSeconds()[this.scoreKey()];
    return seconds === undefined ? null : formatTime(seconds);
  });

  protected readonly time = computed(() => formatTime(this.seconds()));
  protected readonly cells = computed(() => Array.from({ length: cellCount(this.level()) }, (_, cell) => cell));

  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      this.bestSeconds.set(readBestSeconds());
      this.newGame();
    });
    inject(DestroyRef).onDestroy(() => this.stopTimer());
  }

  protected chooseMode(id: TurnModeId): void {
    this.modeId.set(id);
    this.newGame();
  }

  protected chooseLevel(id: BoardLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    this.stopTimer();
    this.picture.set(nextPicture(this.picture()?.id ?? null));
    this.taps.set(0);
    this.seconds.set(0);
    this.isNewBest.set(false);
    if (this.modeId() === 'memory') {
      // The whole picture first: every square in place until Ready
      this.turns.set(this.cells().map(() => 0));
      this.phase.set('preview');
    } else {
      this.turns.set(scramble(this.level()));
      this.phase.set('playing');
    }
  }

  /** Memory mode: the player has looked; turn every square away and start */
  protected ready(): void {
    this.turns.set(scramble(this.level()));
    this.phase.set('playing');
  }

  protected tap(cell: number): void {
    if (this.phase() !== 'playing') {
      return;
    }
    if (this.taps() === 0) {
      this.startTimer();
    }
    this.turns.update((turns) => turn(turns, cell));
    this.taps.update((taps) => taps + 1);
    if (isSolved(this.turns())) {
      this.finish();
    }
  }

  /** CSS rotation of a square: a quarter turn per tap, always clockwise */
  protected rotation(cell: number): string {
    return `rotate(${(this.turns()[cell] ?? 0) * 90}deg)`;
  }

  private finish(): void {
    this.stopTimer();
    this.phase.set('solved');
    const best = this.bestSeconds()[this.scoreKey()];
    if (best === undefined || this.seconds() < best) {
      this.bestSeconds.update((scores) => ({ ...scores, [this.scoreKey()]: this.seconds() }));
      this.isNewBest.set(true);
      writeStored(BEST_SECONDS_STORAGE, this.bestSeconds());
    }
  }

  private startTimer(): void {
    const startedAt = Date.now();
    this.timer = setInterval(() => this.seconds.set(Math.floor((Date.now() - startedAt) / 1000)), 1000);
  }

  private stopTimer(): void {
    clearInterval(this.timer);
  }
}

/** Best times saved in this browser, keeping only known keys with whole numbers of seconds */
function readBestSeconds(): BestSeconds {
  const stored = readStored(BEST_SECONDS_STORAGE);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const scores: BestSeconds = {};
  for (const mode of TURN_MODE_IDS) {
    for (const { id } of TURN_LEVELS) {
      const key: ScoreKey = `${mode}:${id}`;
      const value: unknown = Reflect.get(stored, key);
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
        scores[key] = value;
      }
    }
  }
  return scores;
}

/** Seconds as `m:ss`, e.g. `1:05` */
function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
