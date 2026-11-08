import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, output, signal } from '@angular/core';
import { RoomClient } from '../../core/room-client';
import { Round } from '../../core/room-view';
import { createSignsPuzzle, SignsPuzzle } from '../../games/find-the-signs';
import { createQuestion, Question } from '../../games/math-games';
import { Random, seededRandom } from '../../games/random';
import { questionLevelOf, RoomMath, signsLevelOf } from '../../games/room-math';
import { SiteLanguage } from '../../i18n/site-language';
import { TimerBar } from '../../shared/timer-bar';
import { FindTheSignsRound } from '../math-games/rounds/find-the-signs-round';
import { RoundResult } from '../math-games/rounds/round-result';
import { TrueOrFalseRound } from '../math-games/rounds/true-or-false-round';
import { YourAnswerRound } from '../math-games/rounds/your-answer-round';

/** How often the time left is redrawn */
const TICK_MS = 100;

/** The next exercise of the round: a question, or a Find the signs puzzle */
type Exercise = { readonly question: Question } | { readonly puzzle: SignsPuzzle };

/**
 * A math round in a room: everyone gets the same exercises from the round's seed, on the server's clock. Each right
 * answer scores a point and is sent to the room; a wrong one just moves on. It ends for everyone at the same moment.
 */
@Component({
  selector: 'app-room-math-round',
  imports: [FindTheSignsRound, TimerBar, TrueOrFalseRound, YourAnswerRound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './room-math-round.html',
  styleUrls: ['../../shared/game-settings.scss', './rooms.scss'],
})
export class RoomMathRound {
  readonly math = input.required<RoomMath>();
  readonly round = input.required<Round>();
  readonly scored = output<number>();

  private readonly client = inject(RoomClient);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  /** The round's random numbers, the same on every device; a new round starts them again */
  private readonly random = computed<Random>(() => seededRandom(this.round().seed));
  protected readonly score = linkedSignal({ source: this.round, computation: () => 0 });
  protected readonly exercise = linkedSignal({ source: this.random, computation: (): Exercise => this.nextExercise() });

  private readonly now = signal(this.client.serverNow());
  protected readonly secondsLeft = computed(() => Math.max(0, Math.ceil((this.round().endsAt - this.now()) / 1000)));
  protected readonly share = computed(() => {
    const { startsAt, endsAt } = this.round();
    return Math.max(0, Math.min(1, (endsAt - this.now()) / (endsAt - startsAt)));
  });
  protected readonly isOver = computed(() => this.secondsLeft() === 0);
  /** Only Find the signs has signs to choose from (and only its levels exist for it) */
  protected readonly signsOperators = computed(() =>
    this.math().style === 'find-the-signs' ? signsLevelOf(this.math()).operators : [],
  );

  constructor() {
    const ticker = setInterval(() => this.now.set(this.client.serverNow()), TICK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(ticker));
  }

  protected onAnswered({ isCorrect }: RoundResult): void {
    if (this.isOver()) {
      return;
    }
    if (isCorrect) {
      this.score.update((score) => score + 1);
      this.scored.emit(this.score());
    }
    this.exercise.set(this.nextExercise());
  }

  protected questionOf(exercise: Exercise): Question | null {
    return 'question' in exercise ? exercise.question : null;
  }

  protected puzzleOf(exercise: Exercise): SignsPuzzle | null {
    return 'puzzle' in exercise ? exercise.puzzle : null;
  }

  private nextExercise(): Exercise {
    const math = this.math();
    return math.style === 'find-the-signs'
      ? { puzzle: createSignsPuzzle(signsLevelOf(math), this.random()) }
      : { question: createQuestion(questionLevelOf(math), this.random()) };
  }
}
