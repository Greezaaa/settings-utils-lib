import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteTheme } from '../../core/site-theme';
import { createSignsPuzzle, formatSigns, getSignsLevel, SIGNS_LEVELS, SignsPuzzle } from '../../games/find-the-signs';
import { ANSWER_STYLE_IDS, AnswerStyleId, createQuestion, formatQuestion, getLevel, LEVELS, LevelId, Question, secondsForQuestion, TIMER_IDS, TimerId, Timing } from '../../games/math-games';
import { readStored, writeStored } from './game-storage';
import { GAME_THEMES, GameThemeId, getGameTheme, isGameThemeId } from './game-themes';
import { GameLanguage, LANGUAGE_IDS } from './i18n/game-language';
import { LanguageId, OptionText } from './i18n/game-messages';
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
const BEST_SCORES_STORAGE = 'best';
const THEME_STORAGE = 'theme';

/** Level picked when the chosen one doesn't exist for the new answer style */
const DEFAULT_LEVEL: LevelId = 'normal';

/** How often the timer bar is redrawn */
const TICK_MS = 50;

/**
 * Math games: the settings screen, the score and the timer.
 * Each answer style is its own round component; this page only hears whether an answer was right.
 * All text comes from the game's language (see i18n/).
 */
@Component({
  selector: 'app-math-games-page',
  imports: [FindTheSignsRound, RouterLink, TrueOrFalseRound, YourAnswerRound],
  providers: [GameLanguage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './math-games-page.html',
  styleUrls: ['../../shared/utility-page.scss', './math-games-page.scss'],
  host: { '[attr.lang]': 'gameLanguage.language()' },
})
export class MathGamesPage {
  /** The home page, which lists every game */
  protected readonly gamesPath = '/';
  protected readonly timers = TIMER_IDS;
  protected readonly answerStyles = ANSWER_STYLE_IDS;
  protected readonly gameThemes = GAME_THEMES;
  protected readonly languages = LANGUAGE_IDS;

  protected readonly gameLanguage = inject(GameLanguage);
  /** Texts in the current language */
  protected readonly t = this.gameLanguage.messages;

  private readonly siteTheme = inject(SiteTheme);
  /** Colours the player picked, if any */
  private readonly chosenTheme = signal<GameThemeId | null>(null);
  /** Page colours while playing: the player's choice, or the site's light or dark until they pick one */
  protected readonly gameTheme = computed<GameThemeId>(
    () => this.chosenTheme() ?? (this.siteTheme.resolved() === 'dark' ? 'dark' : 'light'),
  );

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

  private readonly questionMs = signal(1);
  private readonly remainingMs = signal(0);
  protected readonly secondsLeft = computed(() => Math.ceil(this.remainingMs() / 1000));
  protected readonly timeShare = computed(() => this.remainingMs() / this.questionMs());

  /** The equation with its right answer, shown when the game ends */
  protected readonly solution = computed(() => {
    const puzzle = this.puzzle();
    const question = this.question();
    if (this.isSigns() && puzzle) {
      return formatSigns(puzzle.numbers, puzzle.operators, puzzle.result);
    }
    return question ? formatQuestion({ ...question, shown: question.answer }) : '';
  });

  private deadline = 0;
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    afterNextRender(() => {
      this.bestScores.set(readBestScores());
      const theme = readStored(THEME_STORAGE);
      if (isGameThemeId(theme)) {
        this.applyTheme(theme);
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.stopTimer();
      // The game's colours are for this page only: leaving it brings back the visitor's site theme
      if (this.chosenTheme()) {
        this.siteTheme.restore();
      }
    });
  }

  protected chooseLanguage(id: LanguageId): void {
    this.gameLanguage.set(id);
  }

  protected chooseTheme(id: GameThemeId): void {
    this.applyTheme(id);
    writeStored(THEME_STORAGE, id);
  }

  /** Shows the theme on the whole page for this visit, without changing the visitor's saved site theme */
  private applyTheme(id: GameThemeId): void {
    const { palette } = getGameTheme(id);
    if (typeof palette === 'string') {
      this.siteTheme.show(palette);
    } else {
      this.siteTheme.applyCustom(palette);
    }
    this.chosenTheme.set(id);
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
    this.score.set(0);
    this.isNewBest.set(false);
    this.phase.set('playing');
    this.nextQuestion();
  }

  protected backToSettings(): void {
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
      this.startTimer(secondsForQuestion(this.timing(), this.score(), this.answerStyleId()) * 1000);
    }
  }

  private startTimer(ms: number): void {
    this.stopTimer();
    this.questionMs.set(ms);
    this.remainingMs.set(ms);
    this.deadline = Date.now() + ms;
    this.timer = setInterval(() => {
      const remaining = Math.max(0, this.deadline - Date.now());
      this.remainingMs.set(remaining);
      if (remaining === 0) {
        this.finish('timeout');
      }
    }, TICK_MS);
  }

  private stopTimer(): void {
    clearInterval(this.timer);
  }

  private finish(ending: Ending): void {
    this.stopTimer();
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
