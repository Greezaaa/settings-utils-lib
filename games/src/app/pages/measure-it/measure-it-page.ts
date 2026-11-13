import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gameInfo } from '../../core/games';
import { HINTS_IDS, HintsId } from '../../games/letter-games';
import { GamesApi } from '../../core/games-api';
import { MEASURE_LEVEL_IDS, MEASURE_MODE_IDS, MeasureExercise, measureExercises, MeasureLevelId, MeasureModeId } from '../../games/measure-it';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback/game-feedback';
import { MeasureRound } from './measure-round/measure-round';
import { TranslatePipe } from '../../i18n/translate-pipe';

type Phase = 'ready' | 'playing' | 'done';

@Component({
  selector: 'app-measure-it-page',
  imports: [TranslatePipe, GameBoard, GameFeedback, MeasureRound, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './measure-it-page.html',
  styleUrls: [
    '../../shared/utility-page.scss',
    '../../shared/game-settings.scss',
  ],
})
export class MeasureItPage {
  protected readonly modes = MEASURE_MODE_IDS;
  protected readonly levels = MEASURE_LEVEL_IDS;
  protected readonly hintOptions = HINTS_IDS;
  protected readonly minAge = gameInfo('measure-it').minAge;
  private readonly api = inject(GamesApi);

  protected readonly modeId = signal<MeasureModeId>('read-angle');
  protected readonly levelId = signal<MeasureLevelId>('easy');
  protected readonly hintsId = signal<HintsId>('hints');
  protected readonly hasHints = computed(() => this.hintsId() === 'hints');
  protected readonly phase = signal<Phase>('ready');

  private readonly exercises = signal<readonly MeasureExercise[]>([]);
  protected readonly index = signal(0);
  protected readonly score = signal(0);
  protected readonly total = computed(() => this.exercises().length);
  protected readonly exercise = computed(
    () => this.exercises()[this.index()] ?? null
  );

  protected start(): void {
    this.api.countPlay('measure-it');
    this.exercises.set(
      measureExercises(this.modeId(), this.levelId(), Math.random)
    );
    this.index.set(0);
    this.score.set(0);
    this.phase.set('playing');
  }

  protected onAnswered(isRight: boolean): void {
    if (isRight) {
      this.score.update(score => score + 1);
    }
    if (this.index() + 1 >= this.total()) {
      this.phase.set('done');
    } else {
      this.index.update(index => index + 1);
    }
  }

  protected backToSettings(): void {
    this.phase.set('ready');
  }
}
