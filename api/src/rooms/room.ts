import { randomInt } from 'node:crypto';
import type { LanguageId } from '../shared/catalog.js';

/**
 * Multiplayer rooms (rooms.su-labs.dev): rules only, no sockets, so they can be tested on their own.
 *
 * A host creates a room and shares its short code; up to 4 players join, each with a generated nickname and avatar
 * (no names typed, nothing stored). The host picks the game and settings, everyone presses Ready, the host starts, and
 * all play the same exercises or puzzles (one shared random seed) for the same time; the most points wins (a right
 * answer, or a piece put in place, scores one).
 */

export const MAX_PLAYERS = 4;
export const MIN_PLAYERS_TO_START = 2;
/** Round lengths the host can choose, in seconds */
export const ROUND_SECONDS = [30, 60, 90, 120] as const;
export type RoundSeconds = (typeof ROUND_SECONDS)[number];
/** The 3-2-1 before a round, so every screen starts together */
export const COUNTDOWN_MS = 3500;
/** Late scores are still taken this long after the end, for slow connections */
export const SCORE_GRACE_MS = 1500;

/** Room codes: 6 characters with nothing easy to mix up (no 0/O, 1/I/L) */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

/** Nickname and avatar parts, as ids; each screen shows them in its own language (games site, i18n) */
export const ADJECTIVE_COUNT = 16;
export const ANIMAL_COUNT = 16;
export const COLOR_COUNT = 8;

/**
 * Whether a player chose to be spoken to as a boy or a girl on the games site; each screen then writes their status
 * ("ready", "host") to match, and their animal fits: a girl gets one whose name is feminine (turtle, otter, squirrel,
 * giraffe), a boy one whose name is masculine, as far as the free animals allow
 */
export const PLAYER_GENDERS = ['boy', 'girl'] as const;
export type PlayerGender = (typeof PLAYER_GENDERS)[number];

/** The hand-drawn stickers players can send each other in a room (the games site has their pictures) */
export const REACTIONS = [
  'shy',
  'happy',
  'love',
  'angry',
  'laugh',
  'confused',
  'cry',
] as const;
export type Reaction = (typeof REACTIONS)[number];
/** Least time between two stickers from the same player, so nobody can flood the others' screens */
export const REACTION_GAP_MS = 1500;
const GIRL_ANIMALS: readonly number[] = [9, 11, 13, 15];
const animalsFor = (gender: PlayerGender | null): readonly number[] => {
  const all = Array.from({ length: ANIMAL_COUNT }, (_, index) => index);
  if (gender === 'girl') {
    return GIRL_ANIMALS;
  }
  return gender === 'boy'
    ? all.filter((animal) => !GIRL_ANIMALS.includes(animal))
    : all;
};

/** Games that can be played in a room; each has its own multiplayer switch on the games site */
export const ROOM_GAMES = [
  'math-games',
  'measure-it',
  'letter-games',
  'sliding-puzzle',
  'turn-picture',
  'place-pieces',
] as const;
export type RoomGame = (typeof ROOM_GAMES)[number];

export interface RoomSettings {
  readonly game: RoomGame;
  /** The game's own mode and level ids (e.g. math: answer style and level), checked by the games site */
  readonly mode: string;
  readonly level: string;
  readonly seconds: RoundSeconds;
  /** The room's language, for games with words */
  readonly language: LanguageId;
  /** Whether scores show during the round; some players rush (and slip) when they see them. Results always show them */
  readonly showScores: boolean;
}

export interface Nickname {
  readonly adjective: number;
  readonly animal: number;
}

export interface Player {
  readonly id: string;
  /** Secret that lets this player come back after a reload; never shown to others */
  readonly token: string;
  /** Changes only when the player asks for another one, in the lobby */
  nickname: Nickname;
  readonly color: number;
  readonly gender: PlayerGender | null;
  ready: boolean;
  connected: boolean;
  /** When the connection dropped, to give up on the seat after a while */
  disconnectedAt: number | null;
  score: number;
}

export type RoomPhase = 'lobby' | 'countdown' | 'playing' | 'results';

export interface Round {
  readonly seed: number;
  readonly startsAt: number;
  readonly endsAt: number;
}

export interface Room {
  readonly code: string;
  hostId: string;
  players: Player[];
  settings: RoomSettings;
  phase: RoomPhase;
  round: Round | null;
  lastActivity: number;
}

export type RoomError =
  | 'not-found'
  | 'full'
  | 'in-game'
  | 'not-host'
  | 'not-ready'
  | 'wrong-phase';

export const DEFAULT_SETTINGS: RoomSettings = {
  game: 'math-games',
  mode: 'true-or-false',
  level: 'normal',
  seconds: 60,
  language: 'es',
  showScores: true,
};

/** A whole number from 0 to `max - 1`, from a secure source by default */
export type RandomInt = (max: number) => number;
const secureInt: RandomInt = (max) => randomInt(max);

/** A room code no other room has */
export function newCode(
  taken: ReadonlySet<string>,
  random: RandomInt = secureInt,
): string {
  for (;;) {
    const code = Array.from(
      { length: CODE_LENGTH },
      () => CODE_ALPHABET[random(CODE_ALPHABET.length)],
    ).join('');
    if (!taken.has(code)) {
      return code;
    }
  }
}

/** A random pick among the numbers below `count` that `used` doesn't hold, from `preferred` while one is free */
function freeNumber(
  count: number,
  used: readonly number[],
  random: RandomInt,
  preferred?: readonly number[],
): number {
  const free = Array.from({ length: count }, (_, index) => index).filter(
    (index) => !used.includes(index),
  );
  const freePreferred = free.filter((index) => preferred?.includes(index));
  const choices = freePreferred.length > 0 ? freePreferred : free;
  return choices[random(choices.length)];
}

/** A nickname whose adjective and animal none of `taken` has, the animal fitting the player's choice */
function freeNickname(
  taken: readonly Player[],
  random: RandomInt,
  gender: PlayerGender | null,
): Nickname {
  return {
    adjective: freeNumber(
      ADJECTIVE_COUNT,
      taken.map(({ nickname }) => nickname.adjective),
      random,
    ),
    animal: freeNumber(
      ANIMAL_COUNT,
      taken.map(({ nickname }) => nickname.animal),
      random,
      animalsFor(gender),
    ),
  };
}

/** A new player with a nickname and colour nobody else in the room has, the animal fitting their choice */
export function newPlayer(
  others: readonly Player[],
  random: RandomInt = secureInt,
  gender: PlayerGender | null = null,
): Player {
  const id = Array.from({ length: 12 }, () => random(36).toString(36)).join('');
  const token = Array.from({ length: 32 }, () => random(36).toString(36)).join(
    '',
  );
  return {
    id,
    token,
    nickname: freeNickname(others, random, gender),
    color: freeNumber(
      COLOR_COUNT,
      others.map(({ color }) => color),
      random,
    ),
    gender,
    ready: false,
    connected: true,
    disconnectedAt: null,
    score: 0,
  };
}

export function createRoom(
  code: string,
  host: Player,
  language: LanguageId,
  now: number,
): Room {
  return {
    code,
    hostId: host.id,
    players: [host],
    settings: { ...DEFAULT_SETTINGS, language },
    phase: 'lobby',
    round: null,
    lastActivity: now,
  };
}

/** Adds a player, unless the room is full or a round is on */
export function join(
  room: Room,
  player: Player,
  now: number,
): RoomError | null {
  if (room.players.length >= MAX_PLAYERS) {
    return 'full';
  }
  if (room.phase !== 'lobby') {
    return 'in-game';
  }
  room.players.push(player);
  room.lastActivity = now;
  return null;
}

/** Takes a player out; when it was the host, the next player still connected (or any) takes over */
export function removePlayer(room: Room, playerId: string, now: number): void {
  room.players = room.players.filter(({ id }) => id !== playerId);
  if (room.hostId === playerId && room.players.length > 0) {
    room.hostId = (
      room.players.find(({ connected }) => connected) ?? room.players[0]
    ).id;
  }
  room.lastActivity = now;
}

export function setSettings(
  room: Room,
  playerId: string,
  settings: RoomSettings,
  now: number,
): RoomError | null {
  if (room.hostId !== playerId) {
    return 'not-host';
  }
  if (room.phase !== 'lobby') {
    return 'wrong-phase';
  }
  room.settings = settings;
  // New settings: everyone confirms again
  room.players.forEach((player) => (player.ready = false));
  room.lastActivity = now;
  return null;
}

export function setReady(
  room: Room,
  playerId: string,
  ready: boolean,
  now: number,
): RoomError | null {
  const player = room.players.find(({ id }) => id === playerId);
  if (!player || room.phase !== 'lobby') {
    return 'wrong-phase';
  }
  player.ready = ready;
  room.lastActivity = now;
  return null;
}

/** In the lobby, gives a player another random nickname, unlike their own and everyone else's */
export function renamePlayer(
  room: Room,
  playerId: string,
  now: number,
  random: RandomInt = secureInt,
): RoomError | null {
  const player = room.players.find(({ id }) => id === playerId);
  if (!player || room.phase !== 'lobby') {
    return 'wrong-phase';
  }
  player.nickname = freeNickname(room.players, random, player.gender);
  room.lastActivity = now;
  return null;
}

/** A round can start in the lobby with at least 2 connected players, all of them ready */
export function canStart(room: Room): boolean {
  const connected = room.players.filter((player) => player.connected);
  return (
    room.phase === 'lobby' &&
    connected.length >= MIN_PLAYERS_TO_START &&
    connected.every(({ ready }) => ready)
  );
}

/** Starts a round: the countdown, then everyone plays the same exercises (same seed) for the chosen time */
export function startRound(
  room: Room,
  playerId: string,
  now: number,
  seed: number,
): RoomError | null {
  if (room.hostId !== playerId) {
    return 'not-host';
  }
  if (!canStart(room)) {
    return 'not-ready';
  }
  const startsAt = now + COUNTDOWN_MS;
  room.round = {
    seed,
    startsAt,
    endsAt: startsAt + room.settings.seconds * 1000,
  };
  room.phase = 'countdown';
  room.players.forEach((player) => (player.score = 0));
  room.lastActivity = now;
  return null;
}

/** Most answers a player could plausibly give per second; higher scores are capped */
const MAX_ANSWERS_PER_SECOND = 3;

/**
 * Takes a player's score during the round (it only goes up, and stays plausible for the time played), and moves the
 * room from countdown to playing once the round has started
 */
export function reportScore(
  room: Room,
  playerId: string,
  score: number,
  now: number,
): void {
  const player = room.players.find(({ id }) => id === playerId);
  const round = room.round;
  if (
    !player ||
    !round ||
    now < round.startsAt ||
    now > round.endsAt + SCORE_GRACE_MS
  ) {
    return;
  }
  const elapsedSeconds = (Math.min(now, round.endsAt) - round.startsAt) / 1000;
  const plausible = Math.ceil(elapsedSeconds * MAX_ANSWERS_PER_SECOND);
  player.score = Math.max(player.score, Math.min(Math.floor(score), plausible));
  room.lastActivity = now;
}

/** Moves the room along the clock: countdown → playing → results */
export function advance(room: Room, now: number): boolean {
  const round = room.round;
  if (!round) {
    return false;
  }
  if (room.phase === 'countdown' && now >= round.startsAt) {
    room.phase = 'playing';
    return true;
  }
  if (room.phase === 'playing' && now >= round.endsAt + SCORE_GRACE_MS) {
    room.phase = 'results';
    room.players.forEach((player) => (player.ready = false));
    return true;
  }
  return false;
}

/** Back to the lobby after the results, for another round with the same players */
export function playAgain(
  room: Room,
  playerId: string,
  now: number,
): RoomError | null {
  if (room.hostId !== playerId) {
    return 'not-host';
  }
  if (room.phase !== 'results') {
    return 'wrong-phase';
  }
  room.phase = 'lobby';
  room.round = null;
  room.lastActivity = now;
  return null;
}

/** Each player's place by score; equal scores share a place */
export function places(players: readonly Player[]): Map<string, number> {
  const sorted = [...players].sort(
    (first, second) => second.score - first.score,
  );
  const result = new Map<string, number>();
  sorted.forEach((player, index) => {
    const previous = sorted[index - 1];
    result.set(
      player.id,
      previous && previous.score === player.score
        ? (result.get(previous.id) ?? 1)
        : index + 1,
    );
  });
  return result;
}

/** What every player in the room sees: no tokens */
export interface RoomView {
  readonly code: string;
  readonly hostId: string;
  readonly phase: RoomPhase;
  readonly settings: RoomSettings;
  readonly round: Round | null;
  readonly players: readonly {
    readonly id: string;
    readonly nickname: Nickname;
    readonly color: number;
    readonly gender: PlayerGender | null;
    readonly ready: boolean;
    readonly connected: boolean;
    readonly score: number;
    readonly place: number | null;
  }[];
  /** The server's clock when this was sent, so screens can line up the countdown */
  readonly serverNow: number;
}

export function viewOf(room: Room, now: number): RoomView {
  const ranking = room.phase === 'results' ? places(room.players) : null;
  // With scores hidden, nobody gets them before the results, not even by reading the messages
  const hideScores =
    !room.settings.showScores &&
    (room.phase === 'countdown' || room.phase === 'playing');
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    settings: room.settings,
    round: room.round,
    players: room.players.map(
      ({ id, nickname, color, gender, ready, connected, score }) => ({
        id,
        nickname,
        color,
        gender,
        ready,
        connected,
        score: hideScores ? 0 : score,
        place: ranking?.get(id) ?? null,
      }),
    ),
    serverNow: now,
  };
}
