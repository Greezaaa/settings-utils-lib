import { SuStrengthLevel } from '@su-labs/fields';
import { SuBaseThemeName } from '@su-labs/theme';
import { ErrorSource, ReportStatus, StatsPeriod, SuggestionStatus } from '../core/admin-api';
import { AnswerStyle } from '../core/answer-words';
import { FeatureId } from '../core/features';
import { GameThemeId } from '../core/game-themes';
import { GameCategory, GameSlug } from '../core/games';
import { FeedbackReason, SuggestionCategory } from '../core/games-api';
import { MenuAnimationChoice } from '../core/menu-animation';
import { OfflineChoice } from '../core/offline-mode';
import { PictureId } from '../core/pictures';
import { AccountProblem } from '../core/player-account';
import { Reaction, ReactionSide, StickerDragChoice } from '../core/reactions';
import { RoomError } from '../core/room-view';
import { UpdateKind } from '../core/site-updates';
import { BoardLevelId } from '../games/board';
import { ClimbModeId } from '../games/climb-tower';
import { SignsLevelId } from '../games/find-the-signs';
import { HowManyLevelId } from '../games/how-many';
import { BuilderLevelId, HintsId, LetterModeId, WordCheck } from '../games/letter-games';
import { AnswerStyleId, LevelId, TimerId } from '../games/math-games';
import { AimHint, MeasureLevelId, MeasureModeId } from '../games/measure-it';
import { Direction, MusicLevelId, MusicModeId, NoteId } from '../games/music-notes';
import { PictureModeId } from '../games/picture-game';
import { SudokuGame } from '../games/sudoku';
import { LetterMark, SecretLevelId } from '../games/secret-word';
import { SearchLevelId } from '../games/word-search';
import { WordGender } from './word-gender';

export type LanguageId = 'en' | 'es' | 'eu' | 'it' | 'uk';

export interface SudokuText {
  readonly lead: string;
  readonly rule: string;
  readonly board: string;
  readonly symbols: string;
  readonly tray: string;
  readonly sizeSummary: (symbols: number) => string;
  readonly repeated: string;
  readonly noRepeats: string;
}

export interface OptionText {
  readonly name: string;
  readonly summary: string;
}

export type PuzzlePictureMode = 'lines' | 'drawing';

export interface GameText {
  readonly name: string;
  readonly summary: string;
  readonly subtitle: string;
  readonly intro: string;
}

export interface SiteMessages {
  readonly answers: {
    readonly right: string;
    readonly wrong: string;
    readonly wrongWith: (answer: string) => string;
  };

  readonly site: {
    readonly skipToContent: string;
    readonly gamesNav: string;
    readonly settings: string;
    readonly textSize: string;
    readonly theme: string;
    readonly smallerText: string;
    readonly largerText: string;
    readonly themeNames: Readonly<Record<SuBaseThemeName, string>>;
    readonly menu: string;
    readonly closeMenu: string;
    readonly language: string;
    readonly boardColours: string;
    readonly boardThemes: Readonly<Record<GameThemeId, OptionText>>;
    readonly allColours: string;
    readonly answerStyle: string;
    readonly answerStyles: Readonly<Record<AnswerStyle, OptionText>>;
    readonly menuAnimation: string;
    readonly menuAnimationChoices: Readonly<
      Record<MenuAnimationChoice, string>
    >;
    readonly reactionSide: string;
    readonly reactionSides: Readonly<Record<ReactionSide, string>>;
    readonly stickerDrag: string;
    readonly homeCrumb: string;
    readonly showPassword: string;
    readonly hidePassword: string;
    readonly offlinePlay: string;
    readonly offlinePlayChoices: Readonly<Record<OfflineChoice, string>>;
    readonly offlinePlayHelp: string;
    readonly install: string;
    readonly installButton: string;
    readonly installSteps: string;
    readonly stickerDragChoices: Readonly<Record<StickerDragChoice, string>>;
    readonly wordGender: string;
    readonly wordGenders: Readonly<Record<WordGender, string>>;
    readonly wordGenderQuestion: string;
    readonly wordGenderAnswers: Readonly<Record<WordGender, string>>;
    readonly madeBy: string;
    readonly projectLinks: string;
    readonly privacyNotice: string;
    readonly lastUpdate: (moment: string) => string;
    readonly noticeOk: string;
    readonly noticeLater: string;
    readonly updateReady: string;
    readonly reload: string;
    readonly cancel: string;
    readonly privacySettings: string;
    readonly privacyLink: string;
    readonly suggestionsLink: string;
    readonly loading: string;
  };

  readonly seo: {
    readonly locale: string;
    readonly siteDescription: string;
    readonly notFoundTitle: string;
    readonly notFoundDescription: string;
    readonly previewImageAlt: string;
  };

  readonly games: Readonly<Record<GameSlug, GameText>>;
  readonly categories: Readonly<Record<GameCategory, string>>;

  readonly home: {
    readonly title: string;
    readonly lead: string;
    readonly rule: string;
    readonly whatsNewTitle: string;
    readonly updateKinds: Readonly<Record<UpdateKind, string>>;
    readonly showMore: string;
    readonly showFewer: string;
    readonly categoryGames: (games: number) => string;
    readonly gamesTitle: string;
    readonly searchLabel: string;
    readonly searchPlaceholder: string;
    readonly categoryGroup: string;
    readonly allCategories: string;
    readonly favoritesOnly: string;
    readonly noGames: string;
  };

  readonly categoryIntros: Readonly<Record<GameCategory, string>>;

  readonly slidingPuzzle: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly levelGroup: string;
    readonly levels: Readonly<Record<BoardLevelId, OptionText>>;
    readonly pictureGroup: string;
    readonly pictureModes: Readonly<Record<PuzzlePictureMode, string>>;
    readonly goal: string;
    readonly goalLarger: string;
    readonly goalSmaller: string;
    readonly moves: (moves: number) => string;
    readonly tile: (number: number) => string;
    readonly newPuzzle: string;
    readonly solved: string;
    readonly solvedIn: (moves: number, time: string) => string;
    readonly best: (moves: number) => string;
    readonly newRecord: string;
    readonly keys: string;
  };

  readonly pictureGames: {
    readonly modeGroup: string;
    readonly modes: Readonly<Record<PictureModeId, OptionText>>;
    readonly levelGroup: string;
    readonly levels: Readonly<Record<BoardLevelId, OptionText>>;
    readonly picture: string;
    readonly memorize: string;
    readonly ready: string;
    readonly inPlace: (placed: number, total: number) => string;
    readonly newGame: string;
    readonly solved: string;
    readonly best: (time: string) => string;
    readonly newRecord: string;
  };

  readonly turnPicture: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly tile: (number: number) => string;
    readonly turns: (turns: number) => string;
    readonly solvedIn: (turns: number, time: string) => string;
  };

  readonly placePieces: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly piece: (number: number, picked: boolean) => string;
    readonly swaps: (swaps: number) => string;
    readonly solvedIn: (swaps: number, time: string) => string;
  };

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
    readonly sentTitle: string;
    readonly sentLead: string;
    readonly sent: readonly string[];
    readonly neverTitle: string;
    readonly never: readonly string[];
    readonly microphone: string;
    readonly inDevelopment: string;
    readonly accountsTitle: string;
    readonly accountsLead: string;
    readonly accounts: readonly string[];
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
    readonly ages: (age: number) => string;
    readonly new: string;
    readonly popular: string;
    readonly hidden: string;
    readonly addFavorite: (game: string) => string;
    readonly removeFavorite: (game: string) => string;
    readonly title: string;
    readonly lead: string;
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
    readonly gap: (position: number, sign: string | null) => string;
    readonly deleteSign: string;
    readonly check: string;
    readonly fillEveryGap: string;
    readonly tapGapToChange: string;
    readonly precedence: string;
    readonly notWholeNumber: string;
  };

  readonly suggestions: {
    readonly title: string;
    readonly lead: string;
    readonly rule: string;
    readonly noPersonalData: string;
    readonly categoryLabel: string;
    readonly categories: Readonly<Record<SuggestionCategory, string>>;
    readonly textLabel: string;
    readonly imageLabel: string;
    readonly imageHint: string;
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

  readonly letterGames: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<LetterModeId, OptionText>>;
    readonly levelGroup: string;
    readonly builderLevels: Readonly<Record<BuilderLevelId, OptionText>>;
    readonly timers: Readonly<Record<TimerId, string>>;
    readonly hintsGroup: string;
    readonly hints: Readonly<Record<HintsId, OptionText>>;
    readonly instructions: Readonly<Record<LetterModeId, string>>;
    readonly progress: (word: number, total: number) => string;
    readonly mistakes: (mistakes: number) => string;
    readonly gap: string;
    readonly letters: string;
    readonly answer: string;
    readonly delete: string;
    readonly check: string;
    readonly keys: string;
    readonly builderKeys: string;
    readonly found: (found: number, total: number) => string;
    readonly checks: Readonly<Record<WordCheck, string>>;
    readonly showWords: string;
    readonly wordsShown: string;
    readonly dictionary: {
      readonly loading: string;
      readonly why: string;
      readonly failed: string;
      readonly credit: string;
    };
    readonly report: string;
    readonly reportThanks: string;
    readonly newLetters: string;
    readonly allFound: string;
    readonly solved: string;
    readonly summary: (words: number, mistakes: number) => string;
  };

  readonly measureIt: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<MeasureModeId, OptionText>>;
    readonly levels: Readonly<Record<MeasureLevelId, string>>;
    readonly levelSummaries: Readonly<
      Record<MeasureModeId, Readonly<Record<MeasureLevelId, string>>>
    >;
    readonly hintsGroup: string;
    readonly hintOptions: Readonly<Record<HintsId, OptionText>>;
    readonly aim: Readonly<Record<AimHint, string>>;
    readonly whichAngle: string;
    readonly makeAngle: (angle: number) => string;
    readonly howFull: string;
    readonly whichNumber: string;
    readonly yourAnswer: string;
    readonly check: string;
    readonly progress: (exercise: number, total: number) => string;
    readonly done: string;
    readonly summary: (right: number, total: number) => string;
  };

  readonly climbTower: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<ClimbModeId, OptionText>>;
    readonly answers: string;
    readonly floors: (floors: number) => string;
    readonly best: (floors: number) => string;
    readonly fell: string;
    readonly summary: (floors: number) => string;
  };

  readonly howMany: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly levels: Readonly<Record<HowManyLevelId, OptionText>>;
    readonly question: string;
    readonly tapHint: string;
    readonly countThis: string;
    readonly great: string;
    readonly tryAgain: string;
    readonly done: string;
    readonly summary: (stars: number, total: number) => string;
    readonly progress: (done: number, total: number) => string;
    readonly soundOn: string;
    readonly soundOff: string;
  };

  readonly sudoku: {
    readonly sizeGroup: string;
    readonly cell: (row: number, column: number, symbol: string) => string;
    readonly check: string;
    readonly done: string;
    readonly summary: (time: string) => string;
    readonly newGame: string;
    readonly games: Readonly<Record<SudokuGame, SudokuText>>;
  };

  readonly wordSearch: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly words: string;
    readonly levels: Readonly<Record<SearchLevelId, OptionText>>;
    readonly cell: (row: number, column: number, letter: string) => string;
    readonly found: (found: number, total: number) => string;
    readonly done: string;
    readonly summary: (time: string) => string;
    readonly newGame: string;
  };

  readonly secretWord: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly picture: string;
    readonly levels: Readonly<Record<SecretLevelId, OptionText>>;
    readonly hintsGroup: string;
    readonly hints: Readonly<Record<HintsId, OptionText>>;
    readonly marks: Readonly<Record<LetterMark, string>>;
    readonly keyboard: string;
    readonly erase: string;
    readonly send: string;
    readonly tooShort: (letters: number) => string;
    readonly triesLeft: (tries: number) => string;
    readonly won: string;
    readonly lost: (word: string) => string;
    readonly newGame: string;
  };

  readonly findPairs: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly levels: Readonly<Record<BoardLevelId, OptionText>>;
    readonly moves: (moves: number) => string;
    readonly pairs: (found: number, total: number) => string;
    readonly card: (number: number) => string;
    readonly done: string;
    readonly summary: (moves: number, time: string) => string;
    readonly best: (moves: number) => string;
    readonly newGame: string;
  };

  readonly hitTheNote: {
    readonly lead: string;
    readonly rule: string;
    readonly board: string;
    readonly modeGroup: string;
    readonly modes: Readonly<Record<MusicModeId, OptionText>>;
    readonly levelGroup: string;
    readonly levels: Readonly<Record<MusicLevelId, OptionText>>;
    readonly instructions: Readonly<Record<MusicModeId, string>>;
    readonly progress: (round: number, total: number) => string;
    readonly mistakes: (mistakes: number) => string;
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
    readonly singHints: Readonly<
      Record<'done' | 'silent' | 'hold' | 'low' | 'high', string>
    >;
    readonly skip: string;
    readonly solved: string;
    readonly summary: (right: number, total: number) => string;
  };

  readonly admin: {
    readonly title: string;
    readonly lead: string;
    readonly email: string;
    readonly password: string;
    readonly wrongCredentials: string;
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
      readonly players: string;
      readonly errors: string;
      readonly team: string;
      readonly account: string;
    };
    readonly saveFailed: string;
    readonly loading: string;
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
    readonly gameCategories: (game: string) => string;
    readonly offlineTitle: string;
    readonly offlineActive: (megabytes: string) => string;
    readonly offlineInactive: string;
    readonly previewHelp: (hiddenBadge: string) => string;
    readonly gamesTitle: string;
    readonly open: string;
    readonly hidden: string;
    readonly byDefault: (open: boolean) => string;
    readonly periodGroup: string;
    readonly periods: Readonly<Record<StatsPeriod, string>>;
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
    readonly playersHelp: string;
    readonly noPlayers: string;
    readonly namesTitle: string;
    readonly namesHelp: string;
    readonly noNames: string;
    readonly nameReports: (count: number) => string;
    readonly allowName: string;
    readonly playerColumns: {
      readonly name: string;
      readonly boards: string;
      readonly joined: string;
    };
    readonly playerShown: string;
    readonly playerRemoved: string;
    readonly plainName: string;
    readonly takeOff: string;
    readonly putBack: string;
    readonly loadMore: string;
    readonly featuresTitle: string;
    readonly featuresHelp: string;
    readonly featureNames: Readonly<Record<FeatureId, string>>;
    readonly multiplayerTitle: string;
    readonly multiplayerHelp: string;
    readonly addMember: string;
    readonly roleLabel: string;
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

  readonly rooms: {
    readonly navLink: string;
    readonly title: string;
    readonly lead: string;
    readonly rule: string;
    readonly create: string;
    readonly createTitle: string;
    readonly joinTitle: string;
    readonly codeLabel: string;
    readonly join: string;
    readonly homeTitle: string;
    readonly homeText: string;
    readonly homeLink: string;
    readonly errors: Readonly<Record<RoomError, string>>;
    readonly connecting: string;
    readonly reconnecting: string;
    readonly roomCode: string;
    readonly copyLink: string;
    readonly copied: string;
    readonly players: (count: number, max: number) => string;
    readonly host: (player: WordGender | null) => string;
    readonly you: string;
    readonly ready: (player: WordGender | null) => string;
    readonly notReady: (player: WordGender | null) => string;
    readonly away: string;
    readonly imReady: string;
    readonly notReadyYet: string;
    readonly start: string;
    readonly needPlayers: (min: number) => string;
    readonly waitingForReady: string;
    readonly waitingForHost: string;
    readonly settingsTitle: string;
    readonly gameGroup: string;
    readonly roundLength: string;
    readonly showScores: string;
    readonly ownNames: string;
    readonly reportName: string;
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
    readonly newName: string;
    readonly reactions: {
      readonly title: string;
      readonly names: Readonly<Record<Reaction, string>>;
    };
    readonly kicked: string;
    readonly gameUnavailable: string;
    readonly animals: readonly string[];
    readonly nickname: (adjective: number, animal: number) => string;
  };

  readonly account: {
    readonly strengthLabel: string;
    readonly strength: Readonly<Record<SuStrengthLevel, string>>;
    readonly navLink: string;
    readonly title: string;
    readonly lead: string;
    readonly rule: string;
    readonly loading: string;
    readonly signInTab: string;
    readonly signUpTab: string;
    readonly forgotTab: string;
    readonly loginName: string;
    readonly loginNameHint: string;
    readonly loginOrEmail: string;
    readonly password: string;
    readonly passwordRule: (min: number) => string;
    readonly repeatPassword: string;
    readonly passwordsDiffer: string;
    readonly screenName: string;
    readonly screenNameHint: string;
    readonly screenNameTip: string;
    readonly screenNameTipLabel: string;
    readonly nameWaiting: string;
    readonly showOnLeaderboard: string;
    readonly showOnLeaderboardHint: string;
    readonly email: string;
    readonly emailHint: string;
    readonly noEmailWarning: string;
    readonly signIn: string;
    readonly signUp: string;
    readonly syncNote: string;
    readonly forgotLead: string;
    readonly sendLink: string;
    readonly linkSent: string;
    readonly sending: string;
    readonly signedInAs: (screenName: string) => string;
    readonly loginNameIs: (loginName: string) => string;
    readonly signOut: string;
    readonly detailsTitle: string;
    readonly emailNeedsPassword: string;
    readonly currentPassword: string;
    readonly save: string;
    readonly saved: string;
    readonly passwordTitle: string;
    readonly newPassword: string;
    readonly changePassword: string;
    readonly passwordChanged: string;
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

  readonly colours: {
    readonly title: string;
    readonly lead: string;
    readonly rule: string;
    readonly use: string;
    readonly inUse: string;
  };

  readonly leaderboard: {
    readonly navLink: string;
    readonly title: string;
    readonly lead: string;
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
    readonly youreHidden: string;
    readonly changeInAccount: string;
    readonly mysteryPlayer: string;
    readonly totals: (players: number, plays: number) => string;
    readonly yourPlays: (plays: number) => string;
    readonly yourBest: (best: string) => string;
    readonly wouldBePlace: (place: number) => string;
    readonly yourPlace: (place: number) => string;
    readonly joinText: string;
  };
}
