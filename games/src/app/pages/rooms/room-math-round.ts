import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, output, signal } from '@angular/core';
import { RoomClient } from '../../core/room-client';
import { Round } from '../../core/room-view';
import { SignsPuzzle } from '../../games/find-the-signs';
import { Question } from '../../games/math-games';
import { RoomExercise, roomExercises, RoomMath, signsLevelOf } from '../../games/room-math';
import { SiteLanguage } from '../../i18n/site-language';
import { TimerBar } from '../../shared/timer-bar';
import { FindTheSignsRound } from '../math-games/rounds/find-the-signs-round';
import { RoundResult } from '../math-games/rounds/round-result';
import { TrueOrFalseRound } from '../math-games/rounds/true-or-false-round';
import { YourAnswerRound } from '../math-games/rounds/your-answer-round';

/** How often the time left is redrawn */
const TICK_MS = 100;

/**
 * A math round in a room: the round's whole list of exercises is built once from its seed, the same on every device,
 * and each player moves through it at their own pace, on the server's clock. Each right answer scores a point and is
 * sent to the room; a wrong one just moves on. It ends for everyone at the same moment.
 *
 * The room's state arrives again with every player's score, so everything here is keyed on the round's seed and
 * settings (plain values), never on those messages: a new message must not restart the round.
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
  /** The room's choice: show the player's own score during the round, or only in the results */
  readonly showScore = input(true);
  readonly scored = output<number>();

  private readonly client = inject(RoomClient);
  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;

  private readonly seed = computed(() => this.round().seed);
  private readonly settings = computed(() => this.math(), {
    equal: (first, second) => first.style === second.style && first.levelId === second.levelId,
  });
  /** Every exercise of the round, built once when the round (its seed) or the settings change */
  private readonly exercises = computed(() => roomExercises(this.settings(), this.seed()));
  private readonly index = linkedSignal({ source: this.exercises, computation: () => 0 });
  protected readonly exercise = computed(() => this.exercises()[this.index() % this.exercises().length]);
  protected readonly score = linkedSignal({ source: this.seed, computation: () => 0 });

  private readonly now = signal(this.client.serverNow());
  protected readonly secondsLeft = computed(() => Math.max(0, Math.ceil((this.round().endsAt - this.now()) / 1000)));
  protected readonly share = computed(() => {
    const { startsAt, endsAt } = this.round();
    return Math.max(0, Math.min(1, (endsAt - this.now()) / (endsAt - startsAt)));
  });
  protected readonly isOver = computed(() => this.secondsLeft() === 0);
  /** Only Find the signs has signs to choose from (and only its levels exist for it) */
  protected readonly signsOperators = computed(() =>
    this.settings().style === 'find-the-signs' ? signsLevelOf(this.settings()).operators : [],
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
    this.index.update((index) => index + 1);
  }

  protected questionOf(exercise: RoomExercise): Question | null {
    return 'question' in exercise ? exercise.question : null;
  }

  protected puzzleOf(exercise: RoomExercise): SignsPuzzle | null {
    return 'puzzle' in exercise ? exercise.puzzle : null;
  }
}
