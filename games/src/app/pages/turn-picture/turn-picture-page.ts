import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { BoardLevelId, cellCount } from '../../games/board';
import { getPictureLevel, PictureModeId } from '../../games/picture-game';
import { isRight, isSolved, scramble, tilesRight, turn, Turns } from '../../games/turn-picture';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { SiteLanguage } from '../../i18n/site-language';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback';
import { GameClock, formatTime } from '../../shared/game-clock';
import { BestTimes, pictureScoreKey, readBestTimes, writeBestTimes } from '../../shared/picture-best-times';
import { PictureSettings } from '../../shared/picture-settings';
import { PictureSlice } from '../../shared/picture-slice';

/** Memory mode starts with the whole picture on show, until the player presses Ready */
type Phase = 'preview' | 'playing' | 'solved';

const BEST_TIMES_STORAGE = RESULT_GAMES['turn-picture'].storage;

/**
 * Turn the picture: tap squares to turn them a quarter clockwise until the drawing is right again.
 * Look mode keeps the drawing visible under the board and marks the squares that are right; Memory mode
 * shows it only until Ready. A counter shows how many squares are right in both modes.
 */
@Component({
  selector: 'app-turn-picture-page',
  imports: [GameBoard, GameFeedback, PictureSettings, PictureSlice, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './turn-picture-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/picture-board.scss',
    '../../shared/game-done.scss',
    './turn-picture-page.scss',
  ],
})
export class TurnPicturePage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  /** The youngest recommended age, shown under the title */
  protected readonly minAge = gameInfo('turn-picture').minAge;
  private readonly api = inject(GamesApi);
  /** Sends finished games to the player's account, when signed in */
  private readonly account = inject(PlayerAccount);

  protected readonly modeId = signal<PictureModeId>('look');
  protected readonly levelId = signal<BoardLevelId>('normal');
  protected readonly level = computed(() => getPictureLevel(this.levelId()));

  /** Chosen in the browser only, so the prerendered page and the first render agree */
  protected readonly picture = signal<GamePicture | null>(null);
  protected readonly turns = signal<Turns>([]);
  protected readonly phase = signal<Phase>('playing');
  protected readonly taps = signal(0);
  protected readonly clock = new GameClock();
  protected readonly isNewBest = signal(false);

  private readonly bestTimes = signal<BestTimes>({});
  private readonly scoreKey = computed(() => pictureScoreKey(this.modeId(), this.levelId()));
  protected readonly best = computed(() => {
    const seconds = this.bestTimes()[this.scoreKey()];
    return seconds === undefined ? null : formatTime(seconds);
  });

  protected readonly cells = computed(() => Array.from({ length: cellCount(this.level()) }, (_, cell) => cell));
  protected readonly right = computed(() => tilesRight(this.turns()));
  /** Look mode marks the squares that are already right */
  protected readonly showHints = computed(() => this.modeId() === 'look' && this.phase() === 'playing');

  constructor() {
    afterNextRender(() => {
      this.bestTimes.set(readBestTimes(BEST_TIMES_STORAGE));
      this.newGame();
    });
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

  protected chooseMode(id: PictureModeId): void {
    this.modeId.set(id);
    this.newGame();
  }

  protected chooseLevel(id: BoardLevelId): void {
    this.levelId.set(id);
    this.newGame();
  }

  protected newGame(): void {
    this.clock.reset();
    this.picture.set(nextPicture(this.picture()?.id ?? null));
    this.taps.set(0);
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
      this.clock.start();
      // The first move starts the game: count it as a play
      this.api.countPlay('turn-picture');
    }
    this.turns.update((turns) => turn(turns, cell));
    this.taps.update((taps) => taps + 1);
    if (isSolved(this.turns())) {
      this.finish();
    }
  }

  protected isTileRight(cell: number): boolean {
    return isRight(this.turns()[cell] ?? 0);
  }

  /** CSS rotation of a square: a quarter turn per tap, always clockwise */
  protected rotation(cell: number): string {
    return `rotate(${(this.turns()[cell] ?? 0) * 90}deg)`;
  }

  private finish(): void {
    this.clock.stop();
    this.phase.set('solved');
    const seconds = this.clock.seconds();
    this.account.record('turn-picture', this.scoreKey(), seconds);
    const best = this.bestTimes()[this.scoreKey()];
    if (best === undefined || seconds < best) {
      this.bestTimes.update((times) => ({ ...times, [this.scoreKey()]: seconds }));
      this.isNewBest.set(true);
      writeBestTimes(BEST_TIMES_STORAGE, this.bestTimes());
    }
  }
}
