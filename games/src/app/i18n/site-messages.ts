import { SuThemeName } from '@su-labs/theme';
import { GameCategory, GameSlug } from '../core/games';
import { FeatureId } from '../core/features';
import { FeedbackReason, SuggestionCategory } from '../core/games-api';
import { PictureId } from '../core/pictures';
import { SignsLevelId } from '../games/find-the-signs';
import { BoardLevelId } from '../games/board';
import { PictureModeId } from '../games/picture-game';
import { AnswerStyleId, LevelId, TimerId } from '../games/math-games';
import { ErrorSource, ReportStatus, StatsPeriod, SuggestionStatus } from '../core/admin-api';
import { RoomError } from '../core/room-view';
import { BuilderLevelId, HintsId, LetterModeId, WordCheck } from '../games/letter-games';
import { Direction, MusicLevelId, MusicModeId, NoteId } from '../games/music-notes';
import { GameThemeId } from '../core/game-themes';
import { AimHint, MeasureLevelId, MeasureModeId } from '../games/measure-it';
import { ClimbModeId } from '../games/climb-tower';
import { HowManyLevelId } from '../games/how-many';
import { AnswerStyle } from '../core/answer-words';
import { WordGender } from './word-gender';
import { AccountProblem } from '../core/player-account';
import { UpdateKind } from '../core/site-updates';

export type LanguageId = 'en' | 'es' | 'eu' | 'it' | 'uk';

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

  /** What every game says about an answer (in words when the visitor chose them; always for screen readers) */
  readonly answers: {
    readonly right: string;
    readonly wrong: string;
    readonly wrongWith: (answer: string) => string;
  };

  /** Header, settings and footer */
  readonly site: {
    readonly skipToContent: string;
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
    /** How games show answers: colours only, or colours and words */
    readonly answerStyle: string;
    readonly answerStyles: Readonly<Record<AnswerStyle, OptionText>>;
    /** The setting to be spoken to as a boy or a girl */
    readonly wordGender: string;
    readonly wordGenders: Readonly<Record<WordGender, string>>;
    readonly madeBy: string;
    readonly projectLinks: string;
    /** Shown once until closed: what the site stores, and that it is never sold or shared */
    readonly privacyNotice: string;
    /** Heads the list of big changes since the visitor's last visit */
    /** When the site was last updated, in the visitor's local time */
    readonly lastUpdate: (moment: string) => string;
    /** Button in "What's new" that opens a new game */
    readonly noticeOk: string;
    /** The cancel button of confirmation dialogs */
    readonly cancel: string;
    readonly privacySettings: string;
    readonly privacyLink: string;
    readonly suggestionsLink: string;
    /** Shown while a game's page checks that the game is open */
    readonly loading: string;
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
    /** "What's new": the latest changes, and the button to see more or fewer */
    readonly whatsNewTitle: string;
    /** The tag beside each change in What's new */
    readonly updateKinds: Readonly<Record<UpdateKind, string>>;
    readonly showMore: string;
    readonly showFewer: string;
    readonly madeByTitle: string;
    readonly madeByText: string;
    /** With the categories menu: the player's favourites, the most played and the latest games, then the categories */
    readonly favoritesTitle: string;
    readonly popularTitle: string;
    readonly recentTitle: string;
    readonly categoriesTitle: string;
    readonly categoryGames: (games: number) => string;
  };

  /** What each category's page says about its games */
  readonly categoryIntros: Readonly<Record<GameCategory, string>>;

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
    readonly columns: {
      readonly what: string;
      readonly where: string;
      readonly why: string;
    };
    readonly saved: readonly {
      readonly what: string;
      readonly where: string;
      readonly why: string;
    }[];
    readonly differenceTitle: string;
    readonly difference: string;
    /** What the games send to our servers (the API and the rooms service) */
    readonly sentTitle: string;
    readonly sentLead: string;
    readonly sent: readonly string[];
    readonly neverTitle: string;
    readonly never: readonly string[];
    /** The microphone item, last in the "never" list; `inDevelopment` follows it while Hit the note is closed */
    readonly microphone: string;
    readonly inDevelopment: string;
    /** Player accounts (shown while accounts are open): what an account keeps and how to delete it */
    readonly accountsTitle: string;
    readonly accountsLead: string;
    readonly accounts: readonly string[];
    /** The email item, last in the accounts list; `emailUnavailable` follows it while the API can't send emails */
    readonly accountsEmail: string;
    readonly emailUnavailable: string;
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
    /** Badge on the most played games */
    readonly popular: string;
    /** Badge the admin sees in preview on games closed to the public */
    readonly hidden: string;
    /** The heart on a game card, for screen readers */
    readonly addFavorite: (game: string) => string;
    readonly removeFavorite: (game: string) => string;
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

  /** The suggestions form */
  readonly suggestions: {
    readonly title: string;
    readonly lead: string;
    /** The call to action, on its own line under the lead */
    readonly rule: string;
    readonly noPersonalData: string;
    readonly categoryLabel: string;
    readonly categories: Readonly<Record<SuggestionCategory, string>>;
    readonly textLabel: string;
    readonly imageLabel: string;
    readonly imageHint: string;
    /** The picture's drop zone: what it says, while a file is over it, and which files it takes */
    readonly chooseImage: string;
    readonly dropHere: string;
    readonly imageTypes: string;
    readonly imageAlt: string;
    readonly imageError: string;
    readonly removeImage: string;
    readonly send: string;
    readonly sending: string;
    readonly sent: string;
    readonly failed: string;
  };

  /** "Do you like this game?" under every game */
  readonly feedback: {
    readonly question: string;
    readonly votes: Readonly<Record<'up' | 'down', string>>;
    readonly why: string;
    readonly reasons: Readonly<Record<FeedbackReason, string>>;
    readonly justSend: string;
    readonly sending: string;
    readonly thanks: string;
    readonly failed: string;
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
    /** Keyboard help, shown on devices with a keyboard */
    readonly keys: string;
    readonly builderKeys: string;
    readonly found: (found: number, total: number) => string;
    /** What the word builder says about a word */
    readonly checks: Readonly<Record<WordCheck, string>>;
    /** Shows the words still missing, and says they are shown */
    readonly showWords: string;
    readonly wordsShown: string;
    /** The word builder's dictionary: downloading (with why, for its tooltip), failed, and its credit */
    readonly dictionary: {
      readonly loading: string;
      readonly why: string;
      readonly failed: string;
      readonly credit: string;
    };
    /** Report a rude bonus word, and the thanks after it */
    readonly report: string;
    readonly reportThanks: string;
    readonly newLetters: string;
    readonly allFound: string;
    readonly solved: string;
    readonly summary: (words: number, mistakes: number) => string;
  };

  /** Measure it: read and make angles, how full a glass is, numbers on a line */
  readonly measureIt: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<MeasureModeId, OptionText>>;
    readonly levels: Readonly<Record<MeasureLevelId, string>>;
    /** What each level means in each mode */
    readonly levelSummaries: Readonly<
      Record<MeasureModeId, Readonly<Record<MeasureLevelId, string>>>
    >;
    readonly hintsGroup: string;
    readonly hintOptions: Readonly<Record<HintsId, OptionText>>;
    /** The hint after a wrong first try: the right answer is more, or less */
    readonly aim: Readonly<Record<AimHint, string>>;
    /** The question above each exercise */
    readonly whichAngle: string;
    readonly makeAngle: (angle: number) => string;
    readonly howFull: string;
    readonly whichNumber: string;
    /** Name of the slider or the choices, for screen readers */
    readonly yourAnswer: string;
    readonly check: string;
    readonly progress: (exercise: number, total: number) => string;
    readonly done: string;
    readonly summary: (right: number, total: number) => string;
  };

  /** Climb the tower: right answers climb a floor, a wrong one falls */
  readonly climbTower: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<ClimbModeId, OptionText>>;
    /** Name of the two answer buttons, for screen readers */
    readonly answers: string;
    readonly floors: (floors: number) => string;
    readonly best: (floors: number) => string;
    readonly fell: string;
    readonly summary: (floors: number) => string;
  };

  /** Find the pairs: turn the cards two at a time and find every pair */
  /** How many? Count the things and tap how many there are (for the youngest) */
  readonly howMany: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly levels: Readonly<Record<HowManyLevelId, OptionText>>;
    readonly question: string;
    readonly tapHint: string;
    /** A thing not counted yet, for screen readers */
    readonly countThis: string;
    readonly great: string;
    readonly tryAgain: string;
    readonly done: string;
    readonly summary: (stars: number, total: number) => string;
    readonly progress: (done: number, total: number) => string;
    readonly soundOn: string;
    readonly soundOff: string;
  };

  readonly findPairs: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    /** Board sizes: name, and how many cards and pictures */
    readonly levels: Readonly<Record<BoardLevelId, OptionText>>;
    readonly moves: (moves: number) => string;
    readonly pairs: (found: number, total: number) => string;
    /** A face-down card, for screen readers */
    readonly card: (number: number) => string;
    readonly done: string;
    readonly summary: (moves: number, time: string) => string;
    readonly best: (moves: number) => string;
    readonly newGame: string;
  };

  /** Hit the note: find the note, higher or lower, sing it */
  readonly hitTheNote: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<MusicModeId, OptionText>>;
    readonly levelGroup: string;
    readonly levels: Readonly<Record<MusicLevelId, OptionText>>;
    /** What to do, shown above each round */
    readonly instructions: Readonly<Record<MusicModeId, string>>;
    readonly progress: (round: number, total: number) => string;
    readonly mistakes: (mistakes: number) => string;
    /** Each note's name in this language (C, Do, До…) */
    readonly noteNames: Readonly<Record<NoteId, string>>;
    readonly notes: string;
    readonly listen: string;
    readonly listenTwo: string;
    readonly directions: Readonly<Record<Direction, string>>;
    readonly startSinging: string;
    readonly micPrivacy: string;
    readonly micAsking: string;
    readonly micDenied: string;
    readonly micUnavailable: string;
    readonly meter: string;
    /** What the singing meter says: done, silence, hold it, too low, too high */
    readonly singHints: Readonly<
      Record<'done' | 'silent' | 'hold' | 'low' | 'high', string>
    >;
    readonly skip: string;
    readonly solved: string;
    readonly summary: (right: number, total: number) => string;
  };

  /** The admin page (/admin): sign in, game switches, plays and feedback, suggestions and reported words */
  readonly admin: {
    readonly title: string;
    readonly lead: string;
    readonly email: string;
    readonly password: string;
    readonly wrongCredentials: string;
    /** The API refuses more sign-in tries for a while */
    readonly tooManyTries: string;
    readonly offline: string;
    readonly checking: string;
    readonly signIn: string;
    readonly signOut: string;
    readonly tabs: {
      readonly games: string;
      readonly plays: string;
      readonly suggestions: string;
      readonly words: string;
      readonly errors: string;
      readonly team: string;
      readonly account: string;
    };
    readonly saveFailed: string;
    readonly loading: string;
    /** The error log */
    readonly errorsHelp: string;
    readonly noErrors: string;
    readonly clearErrors: string;
    readonly confirmClearErrors: string;
    readonly resolveError: string;
    readonly firstSeen: (moment: string) => string;
    readonly errorSources: Readonly<Record<ErrorSource, string>>;
    readonly errorColumns: Readonly<
      Record<
        'when' | 'code' | 'title' | 'problem' | 'page' | 'count' | 'actions',
        string
      >
    >;
    readonly previewTitle: string;
    readonly previewHelp: (hiddenBadge: string) => string;
    readonly gamesTitle: string;
    readonly open: string;
    readonly hidden: string;
    readonly byDefault: (open: boolean) => string;
    readonly periodGroup: string;
    readonly periods: Readonly<Record<StatsPeriod, string>>;
    /** The super admin's button to delete every play and vote, so statistics start again */
    readonly resetStats: string;
    readonly confirmResetStats: string;
    readonly statsReset: string;
    readonly playsTotal: (total: number) => string;
    readonly refresh: string;
    readonly playsColumns: {
      readonly game: string;
      readonly plays: string;
      readonly reasons: string;
    };
    readonly suggestionStatuses: Readonly<Record<SuggestionStatus, string>>;
    readonly showPicture: string;
    readonly pictureAlt: string;
    readonly moveTo: (status: string) => string;
    readonly delete: string;
    readonly confirmDelete: string;
    readonly noSuggestions: string;
    readonly reportStatuses: Readonly<Record<ReportStatus, string>>;
    readonly reportsHelp: string;
    readonly reportColumns: {
      readonly word: string;
      readonly language: string;
      readonly reports: string;
      readonly firstReported: string;
    };
    readonly keepOut: string;
    readonly letCount: string;
    readonly noWords: string;
    /** Feature switches, like rooms; every new feature gets one */
    readonly featuresTitle: string;
    readonly featuresHelp: string;
    readonly featureNames: Readonly<Record<FeatureId, string>>;
    /** Each game's multiplayer switch, apart from its single-player one */
    readonly multiplayerTitle: string;
    readonly multiplayerHelp: string;
    /** Team (super admin) */
    readonly addMember: string;
    readonly roleLabel: string;
    /** What each role can do, shown when adding a member */
    readonly roleHelp: { readonly moderator: string; readonly tester: string };
    readonly makeTester: string;
    readonly makeModerator: string;
    readonly startingPassword: string;
    readonly startingPasswordHelp: string;
    readonly add: string;
    readonly alreadyOnTeam: string;
    readonly inviteFor: (email: string) => string;
    readonly copy: string;
    readonly copied: string;
    readonly inviteExpires: (day: string) => string;
    readonly roles: {
      readonly super: string;
      readonly moderator: string;
      readonly tester: string;
    };
    readonly invited: string;
    readonly active: string;
    readonly inactive: string;
    readonly newLink: string;
    readonly activate: string;
    readonly deactivate: string;
    /** Account and invites */
    readonly changePassword: string;
    readonly currentPassword: string;
    readonly newPassword: string;
    readonly repeatPassword: string;
    readonly passwordRule: (min: number) => string;
    readonly passwordChanged: string;
    readonly wrongPassword: string;
    readonly passwordsDiffer: string;
    readonly inviteTitle: string;
    readonly inviteLead: (email: string) => string;
    readonly acceptInvite: string;
    readonly inviteInvalid: string;
  };

  /** Multiplayer rooms: create or join by code, the lobby, rounds and results */
  readonly rooms: {
    readonly navLink: string;
    readonly title: string;
    readonly lead: string;
    readonly rule: string;
    readonly create: string;
    readonly joinTitle: string;
    readonly codeLabel: string;
    readonly join: string;
    readonly homeTitle: string;
    readonly homeText: string;
    readonly errors: Readonly<Record<RoomError, string>>;
    readonly connecting: string;
    readonly reconnecting: string;
    readonly roomCode: string;
    readonly copyLink: string;
    readonly copied: string;
    readonly players: (count: number, max: number) => string;
    readonly host: string;
    readonly you: string;
    readonly ready: string;
    readonly notReady: string;
    readonly away: string;
    readonly imReady: string;
    readonly notReadyYet: string;
    readonly start: string;
    readonly needPlayers: (min: number) => string;
    readonly waitingForReady: string;
    readonly waitingForHost: string;
    readonly settingsTitle: string;
    /** The host's choice of game, when more than one is open in rooms */
    readonly gameGroup: string;
    readonly roundLength: string;
    /** Whether scores show during the round */
    readonly showScores: string;
    readonly scoresShown: string;
    readonly scoresHidden: string;
    readonly seconds: (seconds: number) => string;
    readonly getReady: string;
    readonly timeLeft: (seconds: number) => string;
    readonly yourScore: (score: number) => string;
    readonly resultsTitle: string;
    readonly place: (place: number) => string;
    readonly points: (points: number) => string;
    readonly playAgain: string;
    readonly leave: string;
    readonly kick: string;
    readonly kicked: string;
    /** When the room's game is switched off for rooms */
    readonly gameUnavailable: string;
    /** Animal names by number (the same animal in every language), for nicknames and avatars */
    readonly animals: readonly string[];
    /** A player's nickname from its adjective and animal numbers, e.g. `Brave Fox`, `Zorro valiente` */
    readonly nickname: (adjective: number, animal: number) => string;
  };

  /** The player's account page: sign up, sign in, change details, sign out, delete; and the password-reset page */
  readonly account: {
    readonly navLink: string;
    readonly title: string;
    readonly lead: string;
    /** Second line of the lead, the call to action */
    readonly rule: string;
    readonly loading: string;
    readonly signInTab: string;
    readonly signUpTab: string;
    readonly forgotTab: string;
    readonly loginName: string;
    readonly loginNameHint: string;
    /** Sign-in takes the login name or the account's email */
    readonly loginOrEmail: string;
    readonly password: string;
    readonly passwordRule: (min: number) => string;
    readonly repeatPassword: string;
    readonly passwordsDiffer: string;
    readonly screenName: string;
    readonly screenNameHint: string;
    /** The tooltip next to the screen name: it is shown to others and needn't be a real name */
    readonly screenNameTip: string;
    readonly screenNameTipLabel: string;
    /** The player's choice to appear on the leaderboards, at sign-up and in the account */
    readonly showOnLeaderboard: string;
    readonly showOnLeaderboardHint: string;
    readonly email: string;
    readonly emailHint: string;
    /** Shown while no email is given: a forgotten password can't be reset */
    readonly noEmailWarning: string;
    readonly signIn: string;
    readonly signUp: string;
    /** Favourites and best results on this device join the account */
    readonly syncNote: string;
    readonly forgotLead: string;
    readonly sendLink: string;
    readonly linkSent: string;
    readonly sending: string;
    readonly signedInAs: (screenName: string) => string;
    readonly loginNameIs: (loginName: string) => string;
    readonly signOut: string;
    readonly detailsTitle: string;
    /** Changing or removing the email needs the password */
    readonly emailNeedsPassword: string;
    readonly currentPassword: string;
    readonly save: string;
    readonly saved: string;
    readonly passwordTitle: string;
    readonly newPassword: string;
    readonly changePassword: string;
    readonly passwordChanged: string;
    /** Deleting only the results, keeping the account */
    readonly resultsTitle: string;
    readonly resultsLead: string;
    readonly deleteResults: string;
    readonly confirmDeleteResults: string;
    readonly resultsDeleted: string;
    readonly deleteTitle: string;
    readonly deleteLead: string;
    readonly deleteAccount: string;
    readonly confirmDelete: string;
    readonly deleted: string;
    readonly problems: Readonly<Record<AccountProblem, string>>;
    readonly resetTitle: string;
    readonly resetLead: string;
    readonly resetSave: string;
    readonly resetDone: string;
  };

  /** Leaderboards for signed-in players: a table per game setting */
  readonly leaderboard: {
    readonly navLink: string;
    readonly title: string;
    readonly lead: string;
    /** Second line of the lead, the call to action */
    readonly rule: string;
    readonly signInFirst: string;
    readonly signInLink: string;
    readonly gameGroup: string;
    readonly loading: string;
    readonly failed: string;
    readonly empty: string;
    readonly columns: {
      readonly place: string;
      readonly name: string;
      readonly plays: string;
      readonly best: string;
    };
    readonly you: string;
    /** For a signed-in player who chose not to appear */
    readonly youreHidden: string;
    readonly changeInAccount: string;
  };
}
