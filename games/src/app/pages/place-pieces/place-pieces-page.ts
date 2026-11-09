import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { BoardLevelId } from '../../games/board';
import { getPictureLevel, PictureModeId, PicturePhase } from '../../games/picture-game';
import { Arrangement, isSolved, piecesPlaced, shuffle, solvedArrangement, swap } from '../../games/place-pieces';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { SiteLanguage } from '../../i18n/site-language';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback';
import { formatTime, GameClock } from '../../shared/game-clock';
import { BestTimes, pictureScoreKey, readBestTimes, writeBestTimes } from '../../shared/picture-best-times';
import { PictureSettings } from '../../shared/picture-settings';
import { PieceSwap, PlaceBoard } from './place-board';

const BEST_TIMES_STORAGE = RESULT_GAMES['place-pieces'].storage;

/**
 * Place the pieces: drag a piece onto another to swap them (or tap two pieces) until the drawing is whole.
 * Look mode keeps the drawing visible and marks the pieces in place; Memory mode shows it only until Ready.
 */
@Component({
  selector: 'app-place-pieces-page',
  imports: [GameBoard, GameFeedback, PictureSettings, PlaceBoard, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './place-pieces-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/picture-board.scss',
    '../../shared/game-done.scss',
    './place-pieces-page.scss',
  ],
})
export class PlacePiecesPage {
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  /** The youngest recommended age, shown under the title */
  protected readonly minAge = gameInfo('place-pieces').minAge;
  private readonly api = inject(GamesApi);
  /** Sends finished games to the player's account, when signed in */
  private readonly account = inject(PlayerAccount);

  protected readonly modeId = signal<PictureModeId>('look');
  protected readonly levelId = signal<BoardLevelId>('normal');
  protected readonly level = computed(() => getPictureLevel(this.levelId()));

  /** Chosen in the browser only, so the prerendered page and the first render agree */
  protected readonly picture = signal<GamePicture | null>(null);
  protected readonly arrangement = signal<Arrangement>([]);
  protected readonly phase = signal<PicturePhase>('playing');
  protected readonly moves = signal(0);
  protected readonly clock = new GameClock();
  protected readonly isNewBest = signal(false);

  private readonly bestTimes = signal<BestTimes>({});
  private readonly scoreKey = computed(() => pictureScoreKey(this.modeId(), this.levelId()));
  protected readonly best = computed(() => {
    const seconds = this.bestTimes()[this.scoreKey()];
    return seconds === undefined ? null : formatTime(seconds);
  });

  protected readonly placed = computed(() => piecesPlaced(this.arrangement()));
  /** Look mode marks the pieces already in place */
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
    this.moves.set(0);
    this.isNewBest.set(false);
    if (this.modeId() === 'memory') {
      // The whole picture first: every piece in place until Ready
      this.arrangement.set(solvedArrangement(this.level()));
      this.phase.set('preview');
    } else {
      this.arrangement.set(shuffle(this.level()));
      this.phase.set('playing');
    }
  }

  /** Memory mode: the player has looked; mix up the pieces and start */
  protected ready(): void {
    this.arrangement.set(shuffle(this.level()));
    this.phase.set('playing');
  }

  protected swapPieces({ first, second }: PieceSwap): void {
    if (this.moves() === 0) {
      this.clock.start();
      // The first move starts the game: count it as a play
      this.api.countPlay('place-pieces');
    }
    this.arrangement.update((arrangement) => swap(arrangement, first, second));
    this.moves.update((moves) => moves + 1);
    if (isSolved(this.arrangement())) {
      this.finish();
    }
  }

  private finish(): void {
    this.clock.stop();
    this.phase.set('solved');
    const seconds = this.clock.seconds();
    this.account.record('place-pieces', this.scoreKey(), seconds);
    const best = this.bestTimes()[this.scoreKey()];
    if (best === undefined || seconds < best) {
      this.bestTimes.update((times) => ({ ...times, [this.scoreKey()]: seconds }));
      this.isNewBest.set(true);
      writeBestTimes(BEST_TIMES_STORAGE, this.bestTimes());
    }
  }
}
