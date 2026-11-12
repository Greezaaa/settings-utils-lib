import { LanguageId } from '../i18n/site-messages';
import { WORD_GENDERS, WordGender } from '../i18n/word-gender';
import { field } from './api-url';
import { ROOM_GAMES, RoomGame } from './features';

/** A room's state as the rooms service (rooms.su-labs.dev, api/src/rooms/) sends it; every field is checked */
export type RoomPhase = 'lobby' | 'countdown' | 'playing' | 'results';
export const ROUND_SECONDS = [30, 60, 90, 120] as const;
export type RoundSeconds = (typeof ROUND_SECONDS)[number];
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS_TO_START = 2;

export interface RoomSettings {
  readonly game: RoomGame;
  readonly mode: string;
  readonly level: string;
  readonly seconds: RoundSeconds;
  readonly language: LanguageId;
  /** Whether scores show during the round (they always do in the results) */
  readonly showScores: boolean;
  /** Whether players' approved screen names show instead of their nicknames (the host's choice, off by default) */
  readonly ownNames: boolean;
}

export interface Nickname {
  readonly adjective: number;
  readonly animal: number;
}

export interface RoomPlayer {
  readonly id: string;
  readonly nickname: Nickname;
  /** Their approved screen name, while the room shows players' own names; null shows the nickname */
  readonly name: string | null;
  readonly color: number;
  /** Whether they chose to be spoken to as a boy or a girl */
  readonly gender: WordGender | null;
  readonly ready: boolean;
  readonly connected: boolean;
  readonly score: number;
  readonly place: number | null;
}

export interface Round {
  readonly seed: number;
  readonly startsAt: number;
  readonly endsAt: number;
}

export interface RoomView {
  readonly code: string;
  readonly hostId: string;
  readonly phase: RoomPhase;
  readonly settings: RoomSettings;
  readonly round: Round | null;
  readonly players: readonly RoomPlayer[];
  readonly serverNow: number;
}

/** Errors the rooms service can answer with, plus the connection itself failing */
export type RoomError =
  | 'not-found'
  | 'full'
  | 'in-game'
  | 'not-host'
  | 'not-ready'
  | 'wrong-phase'
  | 'invalid'
  | 'too-many'
  | 'offline';
const ROOM_ERRORS: readonly RoomError[] = [
  'not-found',
  'full',
  'in-game',
  'not-host',
  'not-ready',
  'wrong-phase',
  'invalid',
  'too-many',
  'offline',
];
const PHASES: readonly RoomPhase[] = [
  'lobby',
  'countdown',
  'playing',
  'results',
];
const LANGUAGES: readonly LanguageId[] = ['en', 'es', 'eu', 'it', 'uk'];

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const oneOf =
  <T>(values: readonly T[]) =>
  (value: unknown): value is T =>
    values.some(item => item === value);

export const isRoomError = oneOf(ROOM_ERRORS);

/** A player's choice from the rooms service, or null for none (or anything unknown) */
const genderOf = (value: unknown): WordGender | null =>
  WORD_GENDERS.find(gender => gender === value) ?? null;

/** A screen name from the rooms service: one word of letters, as the API allows; anything else shows the nickname */
const nameOf = (value: unknown): string | null =>
  typeof value === 'string' && /^\p{L}{3,12}$/u.test(value) ? value : null;

function parsePlayer(item: unknown): RoomPlayer[] {
  const nickname = field(item, 'nickname');
  const [id, color, ready, connected, score, place] = [
    'id',
    'color',
    'ready',
    'connected',
    'score',
    'place',
  ].map(key => field(item, key));
  const [adjective, animal] = [
    field(nickname, 'adjective'),
    field(nickname, 'animal'),
  ];
  return typeof id === 'string' &&
    isNumber(adjective) &&
    isNumber(animal) &&
    isNumber(color) &&
    typeof ready === 'boolean' &&
    typeof connected === 'boolean' &&
    isNumber(score) &&
    (place === null || isNumber(place))
    ? [
        {
          id,
          nickname: { adjective, animal },
          name: nameOf(field(item, 'name')),
          color,
          gender: genderOf(field(item, 'gender')),
          ready,
          connected,
          score,
          place,
        },
      ]
    : [];
}

function parseSettings(value: unknown): RoomSettings | null {
  const [game, mode, level, seconds, language, showScores, ownNames] = [
    'game',
    'mode',
    'level',
    'seconds',
    'language',
    'showScores',
    'ownNames',
  ].map(key => field(value, key));
  return oneOf(ROOM_GAMES)(game) &&
    typeof mode === 'string' &&
    typeof level === 'string' &&
    oneOf(ROUND_SECONDS)(seconds) &&
    oneOf(LANGUAGES)(language)
    ? // An older rooms service sends no showScores (scores show, as they always did) nor ownNames (nicknames only)
      { game, mode, level, seconds, language, showScores: showScores !== false, ownNames: ownNames === true }
    : null;
}

function parseRound(value: unknown): Round | null {
  const [seed, startsAt, endsAt] = ['seed', 'startsAt', 'endsAt'].map(key =>
    field(value, key)
  );
  return isNumber(seed) && isNumber(startsAt) && isNumber(endsAt)
    ? { seed, startsAt, endsAt }
    : null;
}

/** A room message from the server, or null when it doesn't have the right shape */
export function parseRoomView(data: unknown): RoomView | null {
  const [code, hostId, phase, players, serverNow] = [
    'code',
    'hostId',
    'phase',
    'players',
    'serverNow',
  ].map(key => field(data, key));
  const settings = parseSettings(field(data, 'settings'));
  if (
    typeof code !== 'string' ||
    typeof hostId !== 'string' ||
    !oneOf(PHASES)(phase) ||
    !Array.isArray(players) ||
    !isNumber(serverNow) ||
    !settings
  ) {
    return null;
  }
  return {
    code,
    hostId,
    phase,
    settings,
    round: parseRound(field(data, 'round')),
    players: players.flatMap((item: unknown) => parsePlayer(item)),
    serverNow,
  };
}
