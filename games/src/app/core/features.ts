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
  | 'sticker-drag'
  | 'offline'
  | 'install-app';

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
  readonly openByDefault: boolean;
  readonly roomGame?: RoomGame;
  readonly needsConnection?: boolean;
}

export const FEATURES: readonly FeatureInfo[] = [
  { id: 'rooms', openByDefault: true, needsConnection: true },
  { id: 'rooms-math-games', openByDefault: true, roomGame: 'math-games', needsConnection: true },
  { id: 'rooms-measure-it', openByDefault: true, roomGame: 'measure-it', needsConnection: true },
  { id: 'rooms-letter-games', openByDefault: true, roomGame: 'letter-games', needsConnection: true },
  { id: 'rooms-sliding-puzzle', openByDefault: true, roomGame: 'sliding-puzzle', needsConnection: true },
  { id: 'rooms-turn-picture', openByDefault: true, roomGame: 'turn-picture', needsConnection: true },
  { id: 'rooms-place-pieces', openByDefault: true, roomGame: 'place-pieces', needsConnection: true },
  { id: 'answer-words', openByDefault: true },
  { id: 'word-gender', openByDefault: true },
  { id: 'menu-ring', openByDefault: true },
  { id: 'category-menu', openByDefault: true },
  { id: 'accounts', openByDefault: true },
  { id: 'leaderboard', openByDefault: true },
  { id: 'lively-fields', openByDefault: false },
  { id: 'colours-page', openByDefault: false },
  { id: 'room-rename', openByDefault: false },
  { id: 'public-leaderboard', openByDefault: false },
  { id: 'how-many-sound', openByDefault: false },
  { id: 'room-reactions', openByDefault: true },
  { id: 'room-names', openByDefault: false },
  { id: 'sticker-drag', openByDefault: false },
  { id: 'offline', openByDefault: false },
  { id: 'install-app', openByDefault: false },
];

export const FEATURE_IDS: readonly FeatureId[] = FEATURES.map(({ id }) => id);

export const ROOM_GAMES: readonly RoomGame[] = FEATURES.flatMap(
  ({ roomGame }) => (roomGame ? [roomGame] : [])
);

export const ROOM_GAME_FEATURES: Readonly<Record<RoomGame, FeatureId>> = {
  'math-games': 'rooms-math-games',
  'measure-it': 'rooms-measure-it',
  'letter-games': 'rooms-letter-games',
  'sliding-puzzle': 'rooms-sliding-puzzle',
  'turn-picture': 'rooms-turn-picture',
  'place-pieces': 'rooms-place-pieces',
};
