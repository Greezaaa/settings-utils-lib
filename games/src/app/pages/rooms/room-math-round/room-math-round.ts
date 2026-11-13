import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { Round } from '../../../core/room-view';
import { SignsPuzzle } from '../../../games/find-the-signs';
import { Question } from '../../../games/math-games';
import { RoomExercise, roomExercises, RoomMath, signsLevelOf } from '../../../games/room-math';
import { TimerBar } from '../../../shared/timer-bar/timer-bar';
import { FindTheSignsRound } from '../../math-games/rounds/find-the-signs-round/find-the-signs-round';
import { RoundResult } from '../../math-games/rounds/round-result';
import { TrueOrFalseRound } from '../../math-games/rounds/true-or-false-round/true-or-false-round';
import { YourAnswerRound } from '../../math-games/rounds/your-answer-round/your-answer-round';
import { roundClock } from '../round-clock';
import { scoreAfterAnswer } from '../../../games/room-games';
import { TranslatePipe } from '../../../i18n/translate-pipe';

@Component({
  selector: 'app-room-math-round',
  imports: [TranslatePipe, FindTheSignsRound, TimerBar, TrueOrFalseRound, YourAnswerRound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-math-round.html',
  styleUrls: ['../../../shared/game-settings.scss', '../rooms.scss'],
})
export class RoomMathRound {
  readonly math = input.required<RoomMath>();
  readonly round = input.required<Round>();
  readonly showScore = input(true);
  readonly scored = output<number>();


  private readonly seed = computed(() => this.round().seed);
  private readonly settings = computed(() => this.math(), {
    equal: (first, second) =>
      first.style === second.style && first.levelId === second.levelId,
  });
  private readonly exercises = computed(() =>
    roomExercises(this.settings(), this.seed())
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

  protected readonly clock = roundClock(this.round);
  protected readonly signsOperators = computed(() =>
    this.settings().style === 'find-the-signs'
      ? signsLevelOf(this.settings()).operators
      : []
  );

  protected onAnswered({ isCorrect }: RoundResult): void {
    if (this.clock.isOver()) {
      return;
    }
    this.score.update(score => scoreAfterAnswer(score, isCorrect));
    this.scored.emit(this.score());
    this.index.update(index => index + 1);
  }

  protected questionOf(exercise: RoomExercise): Question | null {
    return 'question' in exercise ? exercise.question : null;
  }

  protected puzzleOf(exercise: RoomExercise): SignsPuzzle | null {
    return 'puzzle' in exercise ? exercise.puzzle : null;
  }
}
