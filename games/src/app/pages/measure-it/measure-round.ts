import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal, output } from '@angular/core';
import { AngleExercise, Fill, GlassExercise, isAngleRight, isLineRight, isSameFill, LineExercise, lineEnd, lineValue, MeasureExercise, MeasureModeId } from '../../games/measure-it';
import { SiteLanguage } from '../../i18n/site-language';
import { GlassView } from './glass-view';
import { formatNumber, NumberLineView } from './number-line-view';
import { ProtractorView } from './protractor-view';

/** How long the answer (right, or the right one) shows before the next exercise */
const FEEDBACK_MS = 1300;

/** A fraction as written: `3/4`, `1 1/2` */
export const formatFill = ({ whole, numerator, denominator }: Fill): string =>
  `${whole > 0 ? `${whole} ` : ''}${numerator}/${denominator}`;

/** What the round shows after an answer */
interface Result {
  readonly isRight: boolean;
  readonly answer: string;
}

/**
 * One exercise of Measure it, any mode: the drawing, the slider or the choices, Check, and a moment showing whether it
 * was right (and the right answer) before telling the page. Used alone and in rooms.
 */
@Component({
  selector: 'app-measure-round',
  imports: [GlassView, NumberLineView, ProtractorView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './measure-round.html',
  styleUrl: './measure-round.scss',
})
export class MeasureRound {
  readonly exercise = input.required<MeasureExercise>();
  readonly mode = input.required<MeasureModeId>();
  /** Right or wrong, once the answer has shown */
  readonly answered = output<boolean>();

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  protected readonly formatFill = formatFill;
  protected readonly formatNumber = formatNumber;

  /** The slider's value, starting again with each exercise: a right angle, or the line's start */
  protected readonly value = linkedSignal({
    source: this.exercise,
    computation: (exercise): number =>
      exercise.kind === 'line' ? exercise.start : 90,
  });
  protected readonly result = linkedSignal({
    source: this.exercise,
    computation: (): Result | null => null,
  });

  protected readonly angle = computed(() => this.asAngle(this.exercise()));
  protected readonly glass = computed(() => this.asGlass(this.exercise()));
  protected readonly line = computed(() => this.asLine(this.exercise()));
  protected readonly lineMax = computed(() => {
    const line = this.line();
    return line ? lineEnd(line) : 0;
  });

  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected slide(event: Event): void {
    if (event.target instanceof HTMLInputElement && !this.result()) {
      this.value.set(Number(event.target.value));
    }
  }

  /** Checks the slider's answer (angles and number lines) */
  protected check(): void {
    const exercise = this.exercise();
    if (exercise.kind === 'angle') {
      this.finish(isAngleRight(exercise, this.value()), `${exercise.angle}°`);
    } else if (exercise.kind === 'line') {
      this.finish(
        isLineRight(exercise, this.value()),
        formatNumber(lineValue(exercise, exercise.mark))
      );
    }
  }

  protected choose(choice: Fill): void {
    const glass = this.glass();
    if (glass) {
      this.finish(isSameFill(choice, glass.fill), formatFill(glass.fill));
    }
  }

  private finish(isRight: boolean, answer: string): void {
    if (this.result()) {
      return;
    }
    this.result.set({ isRight, answer });
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
