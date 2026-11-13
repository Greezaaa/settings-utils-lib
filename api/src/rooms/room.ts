import { randomInt } from 'node:crypto';
import type { LanguageId } from '../shared/catalog.js';

export const MAX_PLAYERS = 4;
export const MIN_PLAYERS_TO_START = 2;
export const ROUND_SECONDS = [30, 60, 90, 120] as const;
export type RoundSeconds = (typeof ROUND_SECONDS)[number];
export const COUNTDOWN_MS = 3500;
export const SCORE_GRACE_MS = 1500;

export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

export const ADJECTIVE_COUNT = 16;
export const ANIMAL_COUNT = 16;
export const COLOR_COUNT = 8;

export const PLAYER_GENDERS = ['boy', 'girl'] as const;
export type PlayerGender = (typeof PLAYER_GENDERS)[number];

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
  readonly mode: string;
  readonly level: string;
  readonly seconds: RoundSeconds;
  readonly language: LanguageId;
  readonly showScores: boolean;
  readonly ownNames: boolean;
}

export interface Nickname {
  readonly adjective: number;
  readonly animal: number;
}

export interface Player {
  readonly id: string;
  readonly token: string;
  nickname: Nickname;
  ownName: string | null;
  readonly color: number;
  readonly gender: PlayerGender | null;
  ready: boolean;
  connected: boolean;
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
  ownNames: false,
};

export type RandomInt = (max: number) => number;
const secureInt: RandomInt = (max) => randomInt(max);

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

export function newPlayer(
  others: readonly Player[],
  random: RandomInt = secureInt,
  gender: PlayerGender | null = null,
  ownName: string | null = null,
): Player {
  const id = Array.from({ length: 12 }, () => random(36).toString(36)).join('');
  const token = Array.from({ length: 32 }, () => random(36).toString(36)).join(
    '',
  );
  return {
    id,
    token,
    nickname: freeNickname(others, random, gender),
    ownName,
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

export function hideName(
  room: Room,
  playerId: string,
  now: number,
): RoomError | null {
  const player = room.players.find(({ id }) => id === playerId);
  if (!player) {
    return 'wrong-phase';
  }
  player.ownName = null;
  room.lastActivity = now;
  return null;
}

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

export function canStart(room: Room): boolean {
  const connected = room.players.filter((player) => player.connected);
  return (
    room.phase === 'lobby' &&
    connected.length >= MIN_PLAYERS_TO_START &&
    connected.every(({ ready }) => ready)
  );
}

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

const MAX_ANSWERS_PER_SECOND = 3;

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
  player.score = Math.min(Math.floor(score), plausible);
  room.lastActivity = now;
}

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

export interface RoomView {
  readonly code: string;
  readonly hostId: string;
  readonly phase: RoomPhase;
  readonly settings: RoomSettings;
  readonly round: Round | null;
  readonly players: readonly {
    readonly id: string;
    readonly nickname: Nickname;
    readonly name: string | null;
    readonly color: number;
    readonly gender: PlayerGender | null;
    readonly ready: boolean;
    readonly connected: boolean;
    readonly score: number;
    readonly place: number | null;
  }[];
  readonly serverNow: number;
}

export function viewOf(room: Room, now: number): RoomView {
  const ranking = room.phase === 'results' ? places(room.players) : null;
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
      ({ id, nickname, ownName, color, gender, ready, connected, score }) => ({
        id,
        nickname,
        name: room.settings.ownNames ? ownName : null,
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
