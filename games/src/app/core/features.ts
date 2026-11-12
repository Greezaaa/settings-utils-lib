import { GameSlug } from './games';

/**
 * Features the admin switches on or off for the public from the admin page, like the games. Every new feature gets a
 * switch here, off by default (`openByDefault: true`), so it can be built and tried in preview before anyone sees it.
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
  | 'leaderboard'
  | 'lively-fields'
  | 'colours-page'
  | 'room-rename'
  | 'public-leaderboard'
  | 'how-many-sound'
  | 'room-reactions'
  | 'room-names'
  | 'sticker-drag';

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
  { id: 'rooms', openByDefault: true },
  { id: 'rooms-math-games', openByDefault: true, roomGame: 'math-games' },
  { id: 'rooms-measure-it', openByDefault: true, roomGame: 'measure-it' },
  { id: 'rooms-letter-games', openByDefault: true, roomGame: 'letter-games' },
  {
    id: 'rooms-sliding-puzzle',
    openByDefault: true,
    roomGame: 'sliding-puzzle',
  },
  { id: 'rooms-turn-picture', openByDefault: true, roomGame: 'turn-picture' },
  { id: 'rooms-place-pieces', openByDefault: true, roomGame: 'place-pieces' },
  /** The header setting to show answers in words too, not only colours */
  { id: 'answer-words', openByDefault: true },
  /** The header setting to be spoken to as a boy or a girl, for the languages whose words change with it */
  { id: 'word-gender', openByDefault: true },
  /** A playful ring in the header menu that drifts after the pointer and frames the link it reaches */
  { id: 'menu-ring', openByDefault: true },
  /** The header lists the categories (each with its page of games) instead of every game */
  { id: 'category-menu', openByDefault: true },
  /** Player accounts: sign in on any device, keeping favourites and best results */
  { id: 'accounts', openByDefault: true },
  /** Leaderboards for signed-in players (needs accounts) */
  { id: 'leaderboard', openByDefault: true },
  /** Animated form fields: room-code boxes, a password strength meter and a suggestion box that grows */
  { id: 'lively-fields', openByDefault: false },
  /** A page with every set of game colours on a sample board, linked from the settings */
  { id: 'colours-page', openByDefault: false },
  /** A button on a player's own avatar in a room that asks for another random nickname */
  { id: 'room-rename', openByDefault: false },
  /** Leaderboards anyone can see, signed in or not; players who chose not to appear are ranked under a mystery name */
  { id: 'public-leaderboard', openByDefault: false },
  /** How many? says the numbers out loud with the browser's voice, which lags in some languages */
  { id: 'how-many-sound', openByDefault: false },
  /** Hand-drawn stickers players send each other in a room, with the side they stick to in the settings */
  { id: 'room-reactions', openByDefault: true },
  /**
   * Signed-in players' screen names in rooms, once a moderator approves them: the host turns them on per room, and any
   * player can hide and report a name
   */
  { id: 'room-names', openByDefault: false },
  /** On phones and tablets, holding the room stickers for a second lets the player move them to an edge or the bottom */
  { id: 'sticker-drag', openByDefault: false },
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
