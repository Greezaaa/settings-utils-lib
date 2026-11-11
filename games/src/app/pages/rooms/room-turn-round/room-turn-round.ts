import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { nextPicture } from '../../../core/pictures';
import { Round } from '../../../core/room-view';
import { PicturePhase } from '../../../games/picture-game';
import { RoomPicture, roomRandom } from '../../../games/room-games';
import { isSolved, scramble, tilesRight, turn } from '../../../games/turn-picture';
import { TimerBar } from '../../../shared/timer-bar/timer-bar';
import { TurnBoard } from '../../turn-picture/turn-board/turn-board';
import { puzzleRun } from '../puzzle-run';
import { roundClock } from '../round-clock';
import { TranslatePipe } from '../../../i18n/translate-pipe';

/**
 * Turn the picture in a room: every player turns the same scrambled pictures, one after another, and scores a point
 * per square the right way up (a finished picture banks all its squares). Keyed on the round's seed and settings
 * (plain values), so a new room message never restarts it.
 */
@Component({
  selector: 'app-room-turn-round',
  imports: [TranslatePipe, TimerBar, TurnBoard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-turn-round.html',
  styleUrls: ['../../../shared/game-settings.scss', '../../../shared/picture-board.scss', '../rooms.scss'],
})
export class RoomTurnRound {
  readonly picture = input.required<RoomPicture>();
  readonly round = input.required<Round>();
  /** The room's choice: show the player's own score during the round, or only in the results */
  readonly showScore = input(true);
  readonly scored = output<number>();

  protected readonly clock = roundClock(this.round);
  private readonly seed = computed(() => this.round().seed);
  protected readonly settings = computed(() => this.picture(), {
    equal: (first, second) => first.mode === second.mode && first.level.id === second.level.id,
  });
  protected readonly run = puzzleRun(this.seed, this.scored);

  protected readonly drawing = computed(() => nextPicture(null, roomRandom(this.seed(), this.run.index())));
  private readonly scrambled = computed(() =>
    scramble(this.settings().level, roomRandom(this.seed(), this.run.index())),
  );
  private readonly isMemory = computed(() => this.settings().mode === 'memory');
  /** Memory mode shows the whole picture until Ready */
  protected readonly phase = linkedSignal({
    source: () => ({ puzzle: this.scrambled(), memory: this.isMemory() }),
    computation: ({ memory }): PicturePhase => (memory ? 'preview' : 'playing'),
  });
  protected readonly turns = linkedSignal({
    source: () => ({ puzzle: this.scrambled(), memory: this.isMemory() }),
    computation: ({ puzzle, memory }) => (memory ? puzzle.map(() => 0) : puzzle),
  });
  protected readonly right = computed(() => tilesRight(this.turns()));

  protected ready(): void {
    this.turns.set(this.scrambled());
    this.phase.set('playing');
  }

  protected tap(cell: number): void {
    if (this.clock.isOver() || this.phase() !== 'playing') {
      return;
    }
    this.turns.update((turns) => turn(turns, cell));
    if (isSolved(this.turns())) {
      this.phase.set('solved');
      this.run.solved(this.turns().length);
    } else {
      this.run.setInPlace(this.right());
    }
  }
}
