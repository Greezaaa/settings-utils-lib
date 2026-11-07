import { SuThemeName } from '@su-labs/theme';
import { GameCategory, GameSlug } from '../core/games';
import { PictureId } from '../core/pictures';
import { SignsLevelId } from '../games/find-the-signs';
import { BoardLevelId } from '../games/board';
import { PictureModeId } from '../games/picture-game';
import { AnswerStyleId, LevelId, TimerId } from '../games/math-games';
import { BuilderLevelId, HintsId, LetterModeId, WordCheck } from '../games/letter-games';
import { GameThemeId } from '../core/game-themes';

export type LanguageId = 'en' | 'es' | 'eu' | 'uk';

/** A setting's name on its button, and a longer description shown on hover or below it */
export interface OptionText {
  readonly name: string;
  readonly summary: string;
}

/** How the sliding puzzle's tiles are drawn: pieces of a line, or pieces of a drawing */
export type PuzzlePictureMode = 'lines' | 'drawing';

/** A game's texts: its name and summary on cards, and its page title and description for search results */
export interface GameText {
  readonly name: string;
  readonly summary: string;
  /** Follows the name in the page title, e.g. `Math games: true or false, …` */
  readonly subtitle: string;
  /** Comes before the summary in the page description */
  readonly intro: string;
}

/** Every text of the games site in one language; each language must fill all of it */
export interface SiteMessages {
  /** The language's own name, e.g. `Español` */
  readonly languageName: string;
  /** Its short code on the language picker, e.g. `ES` */
  readonly languageCode: string;

  /** Header, settings and footer */
  readonly site: {
    readonly skipToContent: string;
    readonly sites: string;
    readonly gamesNav: string;
    readonly settings: string;
    readonly textSize: string;
    readonly theme: string;
    readonly smallerText: string;
    readonly largerText: string;
    readonly themeNames: Readonly<Record<SuThemeName, string>>;
    /** Label of the theme switch, e.g. `Theme: dark. Switch to contrast` */
    readonly themeSwitch: (current: string, next: string) => string;
    readonly language: string;
    readonly boardColours: string;
    readonly boardThemes: Readonly<Record<GameThemeId, OptionText>>;
    readonly madeBy: string;
    readonly projectLinks: string;
    /** Shown once until closed: what the site stores, and that it is never sold or shared */
    readonly privacyNotice: string;
    /** Heads the list of big changes since the visitor's last visit */
    readonly whatsNew: string;
    /** Heading of the latest changes, shown on a first visit */
    readonly latestChanges: string;
    /** When the site was last updated, in the visitor's local time */
    readonly updatedAt: (moment: string) => string;
    readonly lastUpdate: (moment: string) => string;
    /** Button in "What's new" that opens a new game */
    readonly noticeOk: string;
    readonly privacySettings: string;
    readonly privacyLink: string;
  };

  /** Titles, descriptions and image text for search results and link previews */
  readonly seo: {
    /** Open Graph locale, e.g. `es_ES` */
    readonly locale: string;
    readonly siteDescription: string;
    readonly notFoundTitle: string;
    readonly notFoundDescription: string;
    readonly previewImageAlt: string;
  };

  /** Name and description of each game */
  readonly games: Readonly<Record<GameSlug, GameText>>;
  /** Headings of the home page's game lists */
  readonly categories: Readonly<Record<GameCategory, string>>;

  readonly home: {
    readonly title: string;
    readonly lead: string;
    /** Second line of the lead */
    readonly rule: string;
    /** Notice that the site is still in beta, shown above the games */
    readonly betaLabel: string;
    readonly betaText: string;
    /** Note below the games: who makes them */
    readonly madeByTitle: string;
    readonly madeByText: string;
  };

  readonly slidingPuzzle: {
    readonly lead: string;
    /** Second line of the lead */
    readonly rule: string;
    readonly board: string;
    readonly levelGroup: string;
    readonly levels: Readonly<Record<BoardLevelId, OptionText>>;
    readonly pictureGroup: string;
    readonly pictureModes: Readonly<Record<PuzzlePictureMode, string>>;
    readonly goal: string;
    readonly moves: (moves: number) => string;
    readonly tile: (number: number) => string;
    readonly newPuzzle: string;
    readonly solved: string;
    readonly solvedIn: (moves: number, time: string) => string;
    readonly best: (moves: number) => string;
    readonly newRecord: string;
    readonly keys: string;
  };

  /** Texts both picture games share: modes, sizes and the end of a game */
  readonly pictureGames: {
    readonly modeGroup: string;
    readonly modes: Readonly<Record<PictureModeId, OptionText>>;
    readonly levelGroup: string;
    readonly levels: Readonly<Record<BoardLevelId, OptionText>>;
    readonly picture: string;
    readonly memorize: string;
    readonly ready: string;
    /** Progress, e.g. `6 of 9 in place` */
    readonly inPlace: (placed: number, total: number) => string;
    readonly newGame: string;
    readonly solved: string;
    readonly best: (time: string) => string;
    readonly newRecord: string;
  };

  readonly turnPicture: {
    readonly lead: string;
    /** Second line of the lead */
    readonly rule: string;
    readonly board: string;
    readonly tile: (number: number) => string;
    readonly turns: (turns: number) => string;
    readonly solvedIn: (turns: number, time: string) => string;
  };

  readonly placePieces: {
    readonly lead: string;
    /** Second line of the lead */
    readonly rule: string;
    readonly board: string;
    readonly piece: (number: number, picked: boolean) => string;
    readonly swaps: (swaps: number) => string;
    readonly solvedIn: (swaps: number, time: string) => string;
  };

  /** Description of each picture, read by screen readers */
  readonly pictures: Readonly<Record<PictureId, string>>;

  /** The privacy page: what is saved, where and why, and the switch to stop saving */
  readonly privacy: {
    readonly title: string;
    readonly lead: string;
    readonly savedTitle: string;
    readonly columns: { readonly what: string; readonly where: string; readonly why: string };
    readonly saved: readonly { readonly what: string; readonly where: string; readonly why: string }[];
    readonly differenceTitle: string;
    readonly difference: string;
    readonly neverTitle: string;
    readonly never: readonly string[];
    readonly choiceTitle: string;
    readonly choiceLabel: string;
    readonly choiceOn: string;
    readonly choiceOff: string;
    readonly deleteSaved: string;
    readonly deleted: string;
  };

  readonly notFound: {
    readonly title: string;
    readonly lead: string;
    readonly back: string;
    readonly playInstead: string;
  };

  readonly page: {
    readonly section: string;
    /** The youngest recommended age, e.g. `Ages 4+` */
    readonly ages: (age: number) => string;
    /** Badge on a game added lately */
    readonly new: string;
    readonly title: string;
    readonly lead: string;
    /** The one rule, shown on its own line below the lead */
    readonly rule: string;
    readonly game: string;
  };

  readonly settings: {
    readonly answerStyleGroup: string;
    readonly timerGroup: string;
    readonly levelGroup: string;
    readonly answerStyles: Readonly<Record<AnswerStyleId, OptionText>>;
    readonly timers: Readonly<Record<TimerId, OptionText>>;
    readonly levels: Readonly<Record<LevelId, OptionText>>;
    readonly signsLevels: Readonly<Record<SignsLevelId, OptionText>>;
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

  /** The letter games: first vowel, missing vowels, mixed letters and word builder */
  readonly letterGames: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<LetterModeId, OptionText>>;
    readonly levelGroup: string;
    readonly builderLevels: Readonly<Record<BuilderLevelId, OptionText>>;
    /** What the timer option means here; its name comes from settings.timers */
    readonly timers: Readonly<Record<TimerId, string>>;
    readonly hintsGroup: string;
    readonly hints: Readonly<Record<HintsId, OptionText>>;
    /** What to do, shown above each word */
    readonly instructions: Readonly<Record<LetterModeId, string>>;
    readonly progress: (word: number, total: number) => string;
    readonly mistakes: (mistakes: number) => string;
    /** Name of an empty letter box, for screen readers */
    readonly gap: string;
    readonly letters: string;
    readonly answer: string;
    readonly delete: string;
    readonly check: string;
    readonly found: (found: number, total: number) => string;
    /** What the word builder says about a word */
    readonly checks: Readonly<Record<WordCheck, string>>;
    readonly newLetters: string;
    readonly allFound: string;
    readonly solved: string;
    readonly summary: (words: number, mistakes: number) => string;
  };
}
