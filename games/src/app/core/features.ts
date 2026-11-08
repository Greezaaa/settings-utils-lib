import { GameSlug } from './games';

/**
 * Features the admin switches on or off for the public from the admin page, like the games. Every new feature gets a
 * switch here, off by default (`openByDefault: false`), so it can be built and tried in preview before anyone sees it.
 * Each game playable in rooms has its own multiplayer switch (`rooms-<game>`), apart from its single-player one.
 * Keep in sync with FEATURE_IDS in api/src/shared/catalog.ts (its tests check).
 */
export type FeatureId = 'rooms' | 'rooms-math-games';

/** Games playable in rooms, each with its multiplayer switch */
export type RoomGame = Extract<GameSlug, 'math-games'>;

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
];

export const FEATURE_IDS: readonly FeatureId[] = FEATURES.map(({ id }) => id);

/** The multiplayer switch of each game played in rooms */
export const ROOM_GAME_FEATURES: Readonly<Record<RoomGame, FeatureId>> = { 'math-games': 'rooms-math-games' };
