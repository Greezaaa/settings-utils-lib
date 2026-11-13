import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { Round } from '../../../core/room-view';
import { RoomMeasure, roomMeasureExercises } from '../../../games/room-measure';
import { TimerBar } from '../../../shared/timer-bar/timer-bar';
import { MeasureRound } from '../../measure-it/measure-round/measure-round';
import { roundClock } from '../round-clock';
import { scoreAfterAnswer } from '../../../games/room-games';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-room-measure-round',
  imports: [TranslatePipe, MeasureRound, TimerBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-measure-round.html',
  styleUrls: ['../../../shared/game-settings.scss', '../rooms.scss'],
})
export class RoomMeasureRound {
  readonly measure = input.required<RoomMeasure>();
  readonly round = input.required<Round>();
  readonly showScore = input(true);
  readonly scored = output<number>();

  protected readonly clock = roundClock(this.round);

  private readonly seed = computed(() => this.round().seed);
  protected readonly settings = computed(() => this.measure(), {
    equal: (first, second) =>
      first.mode === second.mode && first.levelId === second.levelId,
  });
  private readonly exercises = computed(() =>
    roomMeasureExercises(this.settings(), this.seed())
  );
  private readonly index = linkedSignal({
    source: this.exercises,
    computation: () => 0,
  });
  protected readonly exercise = computed(
    () => this.exercises()[this.index() % this.exercises().length]
  );
  protected readonly score = linkedSignal({
    source: this.seed,
    computation: () => 0,
  });

  protected onAnswered(isRight: boolean): void {
    if (this.clock.isOver()) {
      return;
    }
    this.score.update(score => scoreAfterAnswer(score, isRight));
    this.scored.emit(this.score());
    this.index.update(index => index + 1);
  }
}
