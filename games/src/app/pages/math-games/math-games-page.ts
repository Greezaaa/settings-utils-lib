import { afterNextRender, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { readStored, writeStored } from '../../core/site-storage';
import { createSignsPuzzle, formatSigns, getSignsLevel, SIGNS_LEVELS, SignsPuzzle } from '../../games/find-the-signs';
import { ANSWER_STYLE_IDS, AnswerStyleId, createQuestion, formatSolution, getLevel, LEVELS, LevelId, Question, secondsForQuestion, TIMER_IDS, TimerId, Timing } from '../../games/math-games';
import { gameInfo } from '../../core/games';
import { GamesApi } from '../../core/games-api';
import { PlayerAccount } from '../../core/player-account';
import { RESULT_GAMES } from '../../core/player-results';
import { SiteLanguage } from '../../i18n/site-language';
import { OptionText } from '../../i18n/site-messages';
import { Countdown } from '../../shared/countdown';
import { GameBoard } from '../../shared/game-board';
import { GameFeedback } from '../../shared/game-feedback';
import { TimerBar } from '../../shared/timer-bar';
import { FindTheSignsRound } from './rounds/find-the-signs-round';
import { RoundResult } from './rounds/round-result';
import { TrueOrFalseRound } from './rounds/true-or-false-round';
import { YourAnswerRound } from './rounds/your-answer-round';

type Phase = 'ready' | 'playing' | 'over';

/** Why the game ended */
type Ending = 'wrong' | 'timeout';

/** Best scores are kept apart for each combination of settings, e.g. `your-answer:timer:normal` */
type ScoreKey = `${AnswerStyleId}:${TimerId}:${LevelId}`;
type BestScores = Partial<Record<ScoreKey, number>>;

/** A level button: its id and its translated text */
type LevelOption = OptionText & { readonly id: LevelId };

/** Names of the values the game keeps in this browser */
const BEST_SCORES_STORAGE = RESULT_GAMES['math-games'].storage;

/** Level picked when the chosen one doesn't exist for the new answer style */
const DEFAULT_LEVEL: LevelId = 'normal';

/**
 * Math games: the settings screen, the score and the timer.
 * Each answer style is its own round component; this page only hears whether an answer was right.
 * All text comes from the site's language (see i18n/).
 */
@Component({
  selector: 'app-math-games-page',
  imports: [FindTheSignsRound, GameBoard, GameFeedback, RouterLink, TimerBar, TrueOrFalseRound, YourAnswerRound],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './math-games-page.html',
  styleUrls: ['../../shared/utility-page.scss', '../../shared/game-settings.scss', './math-games-page.scss'],
})
export class MathGamesPage {
  /** The home page, which lists every game */
  protected readonly gamesPath = '/';
  protected readonly timers = TIMER_IDS;
  protected readonly answerStyles = ANSWER_STYLE_IDS;

  /** Texts in the site's language */
  protected readonly t = inject(SiteLanguage).messages;
  /** The youngest recommended age, shown under the title */
  protected readonly minAge = gameInfo('math-games').minAge;
  private readonly api = inject(GamesApi);
  /** Sends finished games to the player's account, when signed in */
  private readonly account = inject(PlayerAccount);

  protected readonly levelId = signal<LevelId>(DEFAULT_LEVEL);
  protected readonly timerId = signal<TimerId>('timer');
  protected readonly answerStyleId = signal<AnswerStyleId>('true-or-false');
  protected readonly isTimed = computed(() => this.timerId() === 'timer');
  protected readonly isSigns = computed(() => this.answerStyleId() === 'find-the-signs');

  /** Level buttons; Find the signs has its own levels */
  protected readonly levels = computed<readonly LevelOption[]>(() => {
    const { levels, signsLevels } = this.t().settings;
    return this.isSigns()
      ? SIGNS_LEVELS.map(({ id }) => ({ id, ...signsLevels[id] }))
      : LEVELS.map(({ id }) => ({ id, ...levels[id] }));
  });
  private readonly level = computed(() => getLevel(this.levelId()));
  protected readonly signsLevel = computed(() => getSignsLevel(this.levelId()));
  private readonly timing = computed<Timing>(() => (this.isSigns() ? this.signsLevel() : this.level()));

  /** Settings of the current game, shown on the end screen */
  protected readonly settingsLabel = computed(() => {
    const { answerStyles, timers } = this.t().settings;
    const level = this.levels().find(({ id }) => id === this.levelId());
    return [level?.name, answerStyles[this.answerStyleId()].name, timers[this.timerId()].name].join(' · ');
  });

  protected readonly phase = signal<Phase>('ready');
  protected readonly question = signal<Question | null>(null);
  protected readonly puzzle = signal<SignsPuzzle | null>(null);
  protected readonly score = signal(0);
  protected readonly ending = signal<Ending>('wrong');
  protected readonly isNewBest = signal(false);
  /** The player's last answer, shown when it ends the game */
  protected readonly given = signal('');

  private readonly bestScores = signal<BestScores>({});
  private readonly scoreKey = computed<ScoreKey>(() => `${this.answerStyleId()}:${this.timerId()}:${this.levelId()}`);
  protected readonly best = computed(() => this.bestScores()[this.scoreKey()] ?? 0);

  protected readonly countdown = new Countdown();

  /** The equation with its right answer, shown when the game ends */
  protected readonly solution = computed(() => {
    const puzzle = this.puzzle();
    const question = this.question();
    if (this.isSigns() && puzzle) {
      return formatSigns(puzzle.numbers, puzzle.operators, puzzle.result);
    }
    return question ? formatSolution(question) : '';
  });

  constructor() {
    afterNextRender(() => {
      this.bestScores.set(readBestScores());
    });
  }

  protected chooseLevel(id: LevelId): void {
    this.levelId.set(id);
  }

  protected chooseTimer(id: TimerId): void {
    this.timerId.set(id);
  }

  protected chooseAnswerStyle(id: AnswerStyleId): void {
    this.answerStyleId.set(id);
    if (!this.levels().some((level) => level.id === this.levelId())) {
      this.levelId.set(DEFAULT_LEVEL);
    }
  }

  protected start(): void {
    this.api.countPlay('math-games');
    this.score.set(0);
    this.isNewBest.set(false);
    this.phase.set('playing');
    this.nextQuestion();
  }

  /** Back to the settings, from the end or in the middle of a game (its timer stops, so nothing ends it later) */
  protected backToSettings(): void {
    this.countdown.stop();
    this.phase.set('ready');
  }

  protected onAnswered({ isCorrect, given }: RoundResult): void {
    if (this.phase() !== 'playing') {
      return;
    }
    if (!isCorrect) {
      this.given.set(given);
      this.finish('wrong');
      return;
    }
    this.score.update((score) => score + 1);
    this.nextQuestion();
  }

  private nextQuestion(): void {
    if (this.isSigns()) {
      this.puzzle.set(createSignsPuzzle(this.signsLevel()));
    } else {
      this.question.set(createQuestion(this.level()));
    }
    if (this.isTimed()) {
      this.countdown.start(secondsForQuestion(this.timing(), this.score(), this.answerStyleId()) * 1000, () =>
        this.finish('timeout'),
      );
    }
  }

  private finish(ending: Ending): void {
    this.countdown.stop();
    this.account.record('math-games', this.scoreKey(), this.score());
    this.ending.set(ending);
    this.phase.set('over');

    if (this.score() > this.best()) {
      this.isNewBest.set(true);
      this.bestScores.update((scores) => ({ ...scores, [this.scoreKey()]: this.score() }));
      writeStored(BEST_SCORES_STORAGE, this.bestScores());
    }
  }
}

/** Best scores saved in this browser, keeping only known keys with numeric values */
function readBestScores(): BestScores {
  const stored = readStored(BEST_SCORES_STORAGE);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const scores: BestScores = {};
  for (const style of ANSWER_STYLE_IDS) {
    for (const timer of TIMER_IDS) {
      for (const level of LEVELS) {
        const key: ScoreKey = `${style}:${timer}:${level.id}`;
        const value: unknown = Reflect.get(stored, key);
        if (typeof value === 'number' && Number.isFinite(value)) {
          scores[key] = value;
        }
      }
    }
  }
  return scores;
}
