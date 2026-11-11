import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { nextPicture } from '../../../core/pictures';
import { Round } from '../../../core/room-view';
import { RoomSliding, roomRandom } from '../../../games/room-games';
import { canMove, createPuzzle, isSolved, move, tilesInPlace } from '../../../games/sliding-puzzle';
import { TimerBar } from '../../../shared/timer-bar/timer-bar';
import { SlidingBoard } from '../../sliding-puzzle/sliding-board/sliding-board';
import { puzzleRun } from '../puzzle-run';
import { roundClock } from '../round-clock';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/**
 * The sliding puzzle in a room: every player solves the same puzzles, one after another, and scores a point per tile
 * in its place (a finished puzzle banks all its tiles). Keyed on the round's seed and settings (plain values), so a
 * new room message never restarts it.
 */
@Component({
  selector: 'app-room-sliding-round',
  imports: [TranslatePipe, SlidingBoard, TimerBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-sliding-round.html',
  styleUrls: ['../../../shared/game-settings.scss', '../../../shared/picture-board.scss', '../rooms.scss'],
})
export class RoomSlidingRound {
  readonly sliding = input.required<RoomSliding>();
  readonly round = input.required<Round>();
  /** The room's choice: show the player's own score during the round, or only in the results */
  readonly showScore = input(true);
  readonly scored = output<number>();

  protected readonly clock = roundClock(this.round);
  private readonly seed = computed(() => this.round().seed);
  protected readonly settings = computed(() => this.sliding(), {
    equal: (first, second) => first.pictureMode === second.pictureMode && first.level.id === second.level.id,
  });
  protected readonly run = puzzleRun(this.seed, this.scored);

  protected readonly drawing = computed(() => nextPicture(null, roomRandom(this.seed(), this.run.index())));
  protected readonly puzzle = linkedSignal(() =>
    createPuzzle(this.settings().level, roomRandom(this.seed(), this.run.index())),
  );
  protected readonly isSolved = computed(() => isSolved(this.puzzle().board, this.puzzle().gap));
  protected readonly inPlace = computed(() => tilesInPlace(this.puzzle().board));
  /** Tiles on the board: every cell but the gap */
  protected readonly tileCount = computed(() => this.puzzle().board.length - 1);

  protected slide(cell: number): void {
    const puzzle = this.puzzle();
    if (this.clock.isOver() || this.isSolved() || !canMove(puzzle.shape, puzzle.board, cell)) {
      return;
    }
    this.puzzle.set({ ...puzzle, board: move(puzzle.shape, puzzle.board, cell) });
    if (this.isSolved()) {
      this.run.solved(this.tileCount());
    } else {
      this.run.setInPlace(this.inPlace());
    }
  }
}
