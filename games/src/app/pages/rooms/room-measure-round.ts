import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { Round } from '../../core/room-view';
import { RoomMeasure, roomMeasureExercises } from '../../games/room-measure';
import { SiteLanguage } from '../../i18n/site-language';
import { TimerBar } from '../../shared/timer-bar';
import { MeasureRound } from '../measure-it/measure-round';
import { roundClock } from './round-clock';

/**
 * A Measure it round in a room, like a math round: the whole list of exercises is built once from the round's seed,
 * each player moves through it at their own pace, every right answer scores a point, and it ends for everyone at once.
 * Everything is keyed on the seed and settings (plain values), so a new room message never restarts the round.
 */
@Component({
  selector: 'app-room-measure-round',
  imports: [MeasureRound, TimerBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-measure-round.html',
  styleUrls: ['../../shared/game-settings.scss', './rooms.scss'],
})
export class RoomMeasureRound {
  readonly measure = input.required<RoomMeasure>();
  readonly round = input.required<Round>();
  /** The room's choice: show the player's own score during the round, or only in the results */
  readonly showScore = input(true);
  readonly scored = output<number>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly clock = roundClock(this.round);

  private readonly seed = computed(() => this.round().seed);
  protected readonly settings = computed(() => this.measure(), {
    equal: (first, second) =>
      first.mode === second.mode && first.levelId === second.levelId,
  });
  /** Every exercise of the round, built once when the round (its seed) or the settings change */
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
    if (isRight) {
      this.score.update(score => score + 1);
      this.scored.emit(this.score());
    }
    this.index.update(index => index + 1);
  }
}
