import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, output } from '@angular/core';
import { aimHint, AimHint, AngleExercise, Fill, fillParts, formatFill, GlassExercise, isAngleRight, isLineRight, isSameFill, LineExercise, lineEnd, MeasureExercise, MeasureModeId, rightValue } from '../../games/measure-it';
import { SiteLanguage } from '../../i18n/site-language';
import { AnswerLine } from '../../shared/answer-line';
import { FractionView } from './fraction-view';
import { GlassView } from './glass-view';
import { formatNumber, NumberLineView } from './number-line-view';
import { CheckedRay, ProtractorView } from './protractor-view';

/** How long the answer (right, or the right one) shows before the next exercise */
const FEEDBACK_MS = 1300;

/** An exercise answered with the slider */
type SliderExercise = AngleExercise | LineExercise;

const isSliderRight = (exercise: SliderExercise, answer: number): boolean =>
  exercise.kind === 'angle'
    ? isAngleRight(exercise, answer)
    : isLineRight(exercise, answer);

/**
 * One exercise of Measure it, any mode: the drawing, the slider or the choices, and Check. The answer shows in colour
 * (green or red, with the right answer drawn) for a moment before the page hears right or wrong. With `hints`, a wrong
 * first try gets a hint (a bit more or less, or the wrong glass marked) and one more try. Used alone and in rooms.
 */
@Component({
  selector: 'app-measure-round',
  imports: [
    AnswerLine,
    FractionView,
    GlassView,
    NumberLineView,
    ProtractorView,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './measure-round.html',
  styleUrl: './measure-round.scss',
})
export class MeasureRound {
  readonly exercise = input.required<MeasureExercise>();
  readonly mode = input.required<MeasureModeId>();
  readonly hints = input(false);
  /** Right or wrong, once the answer has shown */
  readonly answered = output<boolean>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly formatFill = formatFill;
  protected readonly fillParts = fillParts;
  protected readonly formatNumber = formatNumber;

  /** Everything below starts again with each exercise */
  protected readonly value = linkedSignal({
    source: this.exercise,
    computation: (exercise): number =>
      exercise.kind === 'line' ? exercise.start : 90,
  });
  /** Right or wrong once answered for good; null while the player is still answering */
  protected readonly isRight = linkedSignal({
    source: this.exercise,
    computation: (): boolean | null => null,
  });
  protected readonly isDone = computed(() => this.isRight() !== null);
  /** The hint after a wrong first try on the slider */
  protected readonly hint = linkedSignal({
    source: this.exercise,
    computation: (): AimHint | null => null,
  });
  /** Glasses picked wrong, shown in red */
  protected readonly wrongChoices = linkedSignal({
    source: this.exercise,
    computation: (): readonly Fill[] => [],
  });

  protected readonly angle = computed(() => this.asAngle(this.exercise()));
  protected readonly glass = computed(() => this.asGlass(this.exercise()));
  protected readonly line = computed(() => this.asLine(this.exercise()));
  protected readonly lineMax = computed(() => {
    const line = this.line();
    return line ? lineEnd(line) : 0;
  });
  /** The slider moves by the level's step: a few degrees, or the line's step */
  protected readonly step = computed(
    () => this.angle()?.level.step ?? this.line()?.step ?? 1
  );

  /** Once answered: reading, the player's guess in green or red; making, the right angle in green */
  protected readonly checkedRay = computed((): CheckedRay | null => {
    const angle = this.angle();
    const isRight = this.isRight();
    if (!angle || isRight === null) {
      return null;
    }
    return this.mode() === 'set-angle'
      ? { angle: angle.angle, isRight: true }
      : { angle: this.value(), isRight };
  });
  /** Once answered, the number at the line's mark */
  protected readonly lineAnswer = computed(() => {
    const line = this.line();
    return line && this.isDone() ? rightValue(line) : null;
  });
  /** The right answer as text, for the answer line */
  protected readonly rightText = computed(() => {
    const exercise = this.exercise();
    switch (exercise.kind) {
      case 'angle':
        return `${exercise.angle}°`;
      case 'glass':
        return formatFill(exercise.fill, exercise.improper);
      default:
        return formatNumber(rightValue(exercise));
    }
  });

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected slide(event: Event): void {
    if (event.target instanceof HTMLInputElement && !this.isDone()) {
      this.value.set(Number(event.target.value));
    }
  }

  /** Checks the slider's answer (angles and number lines) */
  protected check(): void {
    const exercise = this.angle() ?? this.line();
    if (!exercise || this.isDone()) {
      return;
    }
    if (isSliderRight(exercise, this.value())) {
      this.finish(true);
    } else if (this.hints() && !this.hint()) {
      this.hint.set(aimHint(exercise, this.value()));
    } else {
      this.finish(false);
    }
  }

  protected choose(choice: Fill): void {
    const glass = this.glass();
    if (!glass || this.isDone()) {
      return;
    }
    if (isSameFill(choice, glass.fill)) {
      this.finish(true);
      return;
    }
    const hasTriesLeft = this.hints() && this.wrongChoices().length === 0;
    this.wrongChoices.update(choices => [...choices, choice]);
    if (!hasTriesLeft) {
      this.finish(false);
    }
  }

  protected isWrongChoice(choice: Fill): boolean {
    return this.wrongChoices().some(wrong => isSameFill(wrong, choice));
  }

  protected isRightChoice(choice: Fill): boolean {
    const glass = this.glass();
    return this.isDone() && glass !== null && isSameFill(glass.fill, choice);
  }

  private finish(isRight: boolean): void {
    this.isRight.set(isRight);
    this.timer = setTimeout(() => this.answered.emit(isRight), FEEDBACK_MS);
  }

  private asAngle(exercise: MeasureExercise): AngleExercise | null {
    return exercise.kind === 'angle' ? exercise : null;
  }

  private asGlass(exercise: MeasureExercise): GlassExercise | null {
    return exercise.kind === 'glass' ? exercise : null;
  }

  private asLine(exercise: MeasureExercise): LineExercise | null {
    return exercise.kind === 'line' ? exercise : null;
  }
}
