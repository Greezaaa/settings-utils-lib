import { SuThemeName } from '@su-labs/theme';
import { GameSlug } from '../core/games';
import { SignsLevelId } from '../games/find-the-signs';
import { AnswerStyleId, LevelId, TimerId } from '../games/math-games';
import { GameThemeId } from '../pages/math-games/game-themes';

export type LanguageId = 'en' | 'es' | 'eu';

/** A setting's name on its button, and a longer description shown on hover or below it */
export interface OptionText {
  readonly name: string;
  readonly summary: string;
}

/** Every text of the games site in one language; each language must fill all of it */
export interface SiteMessages {
  /** The language's own name, e.g. `Español` */
  readonly languageName: string;

  /** Header, settings and footer */
  readonly site: {
    readonly skipToContent: string;
    readonly sites: string;
    readonly gamesNav: string;
    readonly settings: string;
    readonly textSize: string;
    readonly smallerText: string;
    readonly largerText: string;
    readonly themeNames: Readonly<Record<SuThemeName, string>>;
    /** Label of the theme switch, e.g. `Theme: dark. Switch to contrast` */
    readonly themeSwitch: (current: string, next: string) => string;
    readonly language: string;
    readonly madeBy: string;
    readonly projectLinks: string;
  };

  /** Titles, descriptions and image text for search results and link previews */
  readonly seo: {
    /** Open Graph locale, e.g. `es_ES` */
    readonly locale: string;
    readonly siteDescription: string;
    /** Follows the game's name in its page title */
    readonly mathGamesSubtitle: string;
    /** Comes before the game's summary in its description */
    readonly mathGamesIntro: string;
    readonly notFoundTitle: string;
    readonly notFoundDescription: string;
    readonly previewImageAlt: string;
  };

  /** Name and description of each game */
  readonly games: Readonly<Record<GameSlug, { readonly name: string; readonly summary: string }>>;

  readonly home: {
    readonly title: string;
    readonly lead: string;
    /** Second line of the lead */
    readonly rule: string;
    readonly games: string;
  };

  readonly notFound: {
    readonly title: string;
    readonly lead: string;
    readonly back: string;
    readonly playInstead: string;
  };

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
