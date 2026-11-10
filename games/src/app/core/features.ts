import { GameSlug } from './games';

/**
 * Features the admin switches on or off for the public from the admin page, like the games. Every new feature gets a
 * switch here, off by default (`openByDefault: false`), so it can be built and tried in preview before anyone sees it.
 * Each game playable in rooms has its own multiplayer switch (`rooms-<game>`), apart from its single-player one.
 * Keep in sync with FEATURE_IDS in api/src/shared/catalog.ts (its tests check).
 */
export type FeatureId =
  | 'rooms'
  | 'rooms-math-games'
  | 'rooms-measure-it'
  | 'rooms-letter-games'
  | 'rooms-sliding-puzzle'
  | 'rooms-turn-picture'
  | 'rooms-place-pieces'
  | 'answer-words'
  | 'word-gender'
  | 'menu-ring'
  | 'category-menu'
  | 'accounts'
  | 'leaderboard';

/** Games playable in rooms, each with its multiplayer switch */
export type RoomGame = Extract<
  GameSlug,
  | 'math-games'
  | 'measure-it'
  | 'letter-games'
  | 'sliding-puzzle'
  | 'turn-picture'
  | 'place-pieces'
>;

export interface FeatureInfo {
  readonly id: FeatureId;
  /** Open to the public until the admin switches it, and whenever the API can't be reached */
  readonly openByDefault: boolean;
  /** For a game's multiplayer switch: the game */
  readonly roomGame?: RoomGame;
}

export const FEATURES: readonly FeatureInfo[] = [
  { id: 'rooms', openByDefault: false },
  { id: 'rooms-math-games', openByDefault: false, roomGame: 'math-games' },
  { id: 'rooms-measure-it', openByDefault: false, roomGame: 'measure-it' },
  { id: 'rooms-letter-games', openByDefault: false, roomGame: 'letter-games' },
  {
    id: 'rooms-sliding-puzzle',
    openByDefault: false,
    roomGame: 'sliding-puzzle',
  },
  { id: 'rooms-turn-picture', openByDefault: false, roomGame: 'turn-picture' },
  { id: 'rooms-place-pieces', openByDefault: false, roomGame: 'place-pieces' },
  /** The header setting to show answers in words too, not only colours */
  { id: 'answer-words', openByDefault: false },
  /** The header setting to be spoken to as a boy or a girl, for the languages whose words change with it */
  { id: 'word-gender', openByDefault: false },
  /** A playful ring in the header menu that drifts after the pointer and frames the link it reaches */
  { id: 'menu-ring', openByDefault: false },
  /** The header lists the categories (each with its page of games) instead of every game */
  { id: 'category-menu', openByDefault: false },
  /** Player accounts: sign in on any device, keeping favourites and best results */
  { id: 'accounts', openByDefault: false },
  /** Leaderboards for signed-in players (needs accounts) */
  { id: 'leaderboard', openByDefault: false },
];

export const FEATURE_IDS: readonly FeatureId[] = FEATURES.map(({ id }) => id);

/** Games playable in rooms, in the order the host sees them */
export const ROOM_GAMES: readonly RoomGame[] = FEATURES.flatMap(
  ({ roomGame }) => (roomGame ? [roomGame] : [])
);

/** The multiplayer switch of each game played in rooms */
export const ROOM_GAME_FEATURES: Readonly<Record<RoomGame, FeatureId>> = {
  'math-games': 'rooms-math-games',
  'measure-it': 'rooms-measure-it',
  'letter-games': 'rooms-letter-games',
  'sliding-puzzle': 'rooms-sliding-puzzle',
  'turn-picture': 'rooms-turn-picture',
  'place-pieces': 'rooms-place-pieces',
};
