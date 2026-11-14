import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GamePicture, nextPicture } from '../../core/pictures';
import { readStored, writeStored } from '../../core/site-storage';
import { BoardLevelId } from '../../games/board';
import { canMove, createPuzzle, getPuzzleLevel, isSolved, move, Puzzle, PUZZLE_LEVELS } from '../../games/sliding-puzzle';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { PuzzlePictureMode } from '../../i18n/site-messages';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { GameClock } from '../../shared/game-clock';
import { PuzzleTile } from './puzzle-tile/puzzle-tile';
import { SlidingBoard } from './sliding-board/sliding-board';
import { TranslatePipe } from '../../i18n/translate-pipe';

const BEST_MOVES_STORAGE = RESULT_GAMES['sliding-puzzle'].storage;
type BestMoves = Partial<Record<BoardLevelId, number>>;

const DEFAULT_LEVEL: BoardLevelId = 'normal';

@Component({
  selector: 'app-sliding-puzzle-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, PuzzleTile, RouterLink, SlidingBoard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sliding-puzzle-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-done.scss',
    '../../shared/play-layout.scss',
    './sliding-puzzle-page.scss',
  ],
})
export class SlidingPuzzlePage {
  protected readonly minAge = gameInfo('sliding-puzzle').minAge;
  private readonly api = inject(GamesApi);
  private readonly account = inject(PlayerAccount);

  protected readonly levels = PUZZLE_LEVELS;
  protected readonly levelId = signal<BoardLevelId>(DEFAULT_LEVEL);
  protected readonly pictureModes: readonly PuzzlePictureMode[] = ['lines', 'drawing'];
  protected readonly pictureMode = signal<PuzzlePictureMode>('lines');
  protected readonly picture = signal<GamePicture | null>(null);

  protected readonly puzzle = signal<Puzzle | null>(null);
  protected readonly moves = signal(0);
  protected readonly clock = new GameClock();
  private readonly bestMovesByLevel = signal<BestMoves>({});
  protected readonly bestMoves = computed(() => this.bestMovesByLevel()[this.levelId()] ?? null);
  protected readonly isNewBest = signal(false);
  protected readonly isGoalLarge = signal(false);

  protected readonly isSolved = computed(() => {
    const puzzle = this.puzzle();
    return puzzle !== null && isSolved(puzzle.board, puzzle.gap);
  });

  constructor() {
    afterNextRender(() => {
      this.bestMovesByLevel.set(readBestMoves());
      this.newPuzzle();
    });
    inject(DestroyRef).onDestroy(() => this.clock.stop());
  }

  protected choosePictureMode(mode: PuzzlePictureMode): void {
    this.pictureMode.set(mode);
    this.newPuzzle();
  }

  protected holeRow({ gap, shape }: Puzzle): number {
    return Math.floor(gap / shape.columns);
  }

  protected holeColumn({ gap, shape }: Puzzle): number {
    return gap % shape.columns;
  }

  protected chooseLevel(id: BoardLevelId): void {
    this.levelId.set(id);
    this.newPuzzle();
  }

  protected newPuzzle(): void {
    this.clock.reset();
    this.puzzle.set(createPuzzle(getPuzzleLevel(this.levelId())));
    this.picture.set(nextPicture(this.picture()?.id ?? null));
    this.moves.set(0);
    this.isNewBest.set(false);
  }

  protected slide(cell: number): void {
    const puzzle = this.puzzle();
    if (!puzzle || this.isSolved() || !canMove(puzzle.shape, puzzle.board, cell)) {
      return;
    }
    if (this.moves() === 0) {
      this.clock.start();
      this.api.countPlay('sliding-puzzle');
    }
    this.puzzle.set({ ...puzzle, board: move(puzzle.shape, puzzle.board, cell) });
    this.moves.update((moves) => moves + 1);
    if (this.isSolved()) {
      this.finish();
    }
  }

  private finish(): void {
    this.clock.stop();
    this.account.record('sliding-puzzle', this.levelId(), this.moves());
    const best = this.bestMoves();
    if (best === null || this.moves() < best) {
      this.bestMovesByLevel.update((scores) => ({ ...scores, [this.levelId()]: this.moves() }));
      this.isNewBest.set(true);
      writeStored(BEST_MOVES_STORAGE, this.bestMovesByLevel());
    }
  }
}

function readBestMoves(): BestMoves {
  const stored = readStored(BEST_MOVES_STORAGE);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const scores: BestMoves = {};
  for (const { id } of PUZZLE_LEVELS) {
    const value: unknown = Reflect.get(stored, id);
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
      scores[id] = value;
    }
  }
  return scores;
}
