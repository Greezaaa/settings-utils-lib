import { SignsLevelId } from '../../../games/find-the-signs';
import { AnswerStyleId, LevelId, TimerId } from '../../../games/math-games';
import { GameThemeId } from '../game-themes';

export type LanguageId = 'en' | 'es' | 'eu';

/** A setting's name on its button, and a longer description shown on hover or below it */
export interface OptionText {
  readonly name: string;
  readonly summary: string;
}

/** Every text of the Math games in one language; each language must fill all of it */
export interface GameMessages {
  /** The language's own name, e.g. `Español` */
  readonly languageName: string;

  readonly page: {
    readonly section: string;
    readonly ages: string;
    readonly title: string;
    readonly lead: string;
    /** The one rule, shown on its own line below the lead */
    readonly rule: string;
    readonly game: string;
  };

  readonly settings: {
    readonly answerStyleGroup: string;
    readonly timerGroup: string;
    readonly coloursGroup: string;
    readonly levelGroup: string;
    readonly languageGroup: string;
    readonly answerStyles: Readonly<Record<AnswerStyleId, OptionText>>;
    readonly timers: Readonly<Record<TimerId, OptionText>>;
    readonly levels: Readonly<Record<LevelId, OptionText>>;
    readonly signsLevels: Readonly<Record<SignsLevelId, OptionText>>;
    readonly themes: Readonly<Record<GameThemeId, OptionText>>;
    readonly bestScore: (best: number) => string;
    readonly start: string;
  };

  readonly playing: {
    readonly seconds: (seconds: number) => string;
    readonly noTimer: string;
    readonly score: (score: number) => string;
  };

  readonly over: {
    readonly outOfTime: string;
    readonly notQuite: string;
    readonly correctAnswers: (score: number) => string;
    readonly newRecord: string;
    readonly best: (best: number) => string;
    readonly youAnswered: string;
    readonly rightAnswer: string;
    readonly playAgain: string;
    readonly changeSettings: string;
  };

  readonly trueOrFalse: {
    readonly true: string;
    readonly false: string;
    /** How the answer is written on the end screen, e.g. `true` */
    readonly given: (saysTrue: boolean) => string;
    readonly keys: string;
  };

  readonly yourAnswer: {
    readonly answer: string;
    readonly numberPad: string;
    readonly delete: string;
    readonly check: string;
    readonly tapNumberFirst: string;
  };

  readonly findTheSigns: {
    readonly signs: string;
    /** Label of a gap, e.g. `Sign 2: empty` */
    readonly gap: (position: number, sign: string | null) => string;
    readonly deleteSign: string;
    readonly check: string;
    readonly fillEveryGap: string;
    readonly tapGapToChange: string;
    readonly precedence: string;
    /** Shown instead of a result when the player's signs leave a remainder or go below zero */
    readonly notWholeNumber: string;
  };
}
