import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { nextPicture } from '../../../core/pictures';
import { Round } from '../../../core/room-view';
import { PicturePhase } from '../../../games/picture-game';
import { isSolved, piecesPlaced, shuffle, solvedArrangement, swap } from '../../../games/place-pieces';
import { RoomPicture, roomRandom } from '../../../games/room-games';
import { TimerBar } from '../../../shared/timer-bar/timer-bar';
import { PieceSwap, PlaceBoard } from '../../place-pieces/place-board/place-board';
import { puzzleRun } from '../puzzle-run';
import { roundClock } from '../round-clock';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-room-place-round',
  imports: [TranslatePipe, PlaceBoard, TimerBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-place-round.html',
  styleUrls: ['../../../shared/game-settings.scss', '../../../shared/picture-board.scss', '../rooms.scss'],
})
export class RoomPlaceRound {
  readonly picture = input.required<RoomPicture>();
  readonly round = input.required<Round>();
  readonly showScore = input(true);
  readonly scored = output<number>();

  protected readonly clock = roundClock(this.round);
  private readonly seed = computed(() => this.round().seed);
  protected readonly settings = computed(() => this.picture(), {
    equal: (first, second) => first.mode === second.mode && first.level.id === second.level.id,
  });
  protected readonly run = puzzleRun(this.seed, this.scored);

  protected readonly drawing = computed(() => nextPicture(null, roomRandom(this.seed(), this.run.index())));
  private readonly shuffled = computed(() => shuffle(this.settings().level, roomRandom(this.seed(), this.run.index())));
  private readonly isMemory = computed(() => this.settings().mode === 'memory');
  protected readonly phase = linkedSignal({
    source: () => ({ puzzle: this.shuffled(), memory: this.isMemory() }),
    computation: ({ memory }): PicturePhase => (memory ? 'preview' : 'playing'),
  });
  protected readonly arrangement = linkedSignal({
    source: () => ({ puzzle: this.shuffled(), memory: this.isMemory() }),
    computation: ({ puzzle, memory }) => (memory ? solvedArrangement(this.settings().level) : puzzle),
  });
  protected readonly placed = computed(() => piecesPlaced(this.arrangement()));

  protected ready(): void {
    this.arrangement.set(this.shuffled());
    this.phase.set('playing');
  }

  protected swapPieces({ first, second }: PieceSwap): void {
    if (this.clock.isOver() || this.phase() !== 'playing') {
      return;
    }
    this.arrangement.update((arrangement) => swap(arrangement, first, second));
    if (isSolved(this.arrangement())) {
      this.phase.set('solved');
      this.run.solved(this.arrangement().length);
    } else {
      this.run.setInPlace(this.placed());
    }
  }
}
