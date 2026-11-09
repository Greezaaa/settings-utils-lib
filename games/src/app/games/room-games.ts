import { RoomGame } from '../core/features';
import { PuzzlePictureMode } from '../i18n/site-messages';
import { BoardLevel, BoardLevelId } from './board';
import { BUILDER_LEVELS, BuilderLevel, HINTS_IDS, LETTER_MODE_IDS, LetterModeId } from './letter-games';
import { ANSWER_STYLE_IDS } from './math-games';
import { MEASURE_LEVEL_IDS, MEASURE_MODE_IDS } from './measure-it';
import { getPictureLevel, PICTURE_LEVELS, PICTURE_MODE_IDS, PictureModeId } from './picture-game';
import { Random, seededRandom } from './random';
import { levelIdsFor, roomMath } from './room-math';
import { getPuzzleLevel, PUZZLE_LEVELS } from './sliding-puzzle';

/** How the sliding puzzle's tiles are drawn, in the order the host sees them */
export const PUZZLE_PICTURE_MODES: readonly PuzzlePictureMode[] = ['lines', 'drawing'];

/** What the host picks for a game in a room: a mode, then a level that mode has; and where a new choice starts */
interface RoomChoices {
  readonly modes: readonly string[];
  readonly levelsOf: (mode: string) => readonly string[];
  readonly mode: string;
  readonly level: string;
}

const levelIds = (levels: readonly { readonly id: string }[]): readonly string[] => levels.map(({ id }) => id);

/** Every room game's modes and levels, as ids; each screen names them in its own language */
export const ROOM_CHOICES: Readonly<Record<RoomGame, RoomChoices>> = {
  'math-games': {
    modes: ANSWER_STYLE_IDS,
    levelsOf: (mode) => levelIdsFor(roomMath(mode, '').style),
    mode: 'true-or-false',
    level: 'normal',
  },
  'measure-it': {
    modes: MEASURE_MODE_IDS,
    levelsOf: () => MEASURE_LEVEL_IDS,
    mode: MEASURE_MODE_IDS[0],
    level: MEASURE_LEVEL_IDS[0],
  },
  'letter-games': {
    modes: LETTER_MODE_IDS,
    // The word builder's levels are its number of letters; the other modes choose hints or not
    levelsOf: (mode) => (mode === 'word-builder' ? levelIds(BUILDER_LEVELS) : HINTS_IDS),
    mode: 'first-vowel',
    level: 'hints',
  },
  'sliding-puzzle': {
    modes: PUZZLE_PICTURE_MODES,
    levelsOf: () => levelIds(PUZZLE_LEVELS),
    mode: 'lines',
    level: 'normal',
  },
  'turn-picture': {
    modes: PICTURE_MODE_IDS,
    levelsOf: () => levelIds(PICTURE_LEVELS),
    mode: 'look',
    level: 'normal',
  },
  'place-pieces': {
    modes: PICTURE_MODE_IDS,
    levelsOf: () => levelIds(PICTURE_LEVELS),
    mode: 'look',
    level: 'normal',
  },
};

/**
 * A mode and level the game has, from the ids a room passed on: unknown ones (an older or newer site, a tampered
 * message, or a level the new mode lacks) fall back to the game's own
 */
export function roomChoice(game: RoomGame, mode: string, level: string): { mode: string; level: string } {
  const choices = ROOM_CHOICES[game];
  const knownMode = choices.modes.includes(mode) ? mode : choices.mode;
  const levels = choices.levelsOf(knownMode);
  const fallback = levels.includes(choices.level) ? choices.level : levels[0];
  return { mode: knownMode, level: levels.includes(level) ? level : fallback };
}

/** Finds an id in a list of known ids, so it has the list's type */
const known = <T extends string>(ids: readonly T[], id: string, fallback: T): T =>
  ids.find((candidate) => candidate === id) ?? fallback;

const BOARD_LEVEL_IDS: readonly BoardLevelId[] = ['easy', 'normal', 'hard', 'expert'];

/** Letter games in a room: the mode, and hints or the word builder's level */
export interface RoomLetters {
  readonly mode: LetterModeId;
  readonly hints: boolean;
  readonly builderLevel: BuilderLevel;
}

export function roomLetters(mode: string, level: string): RoomLetters {
  const choice = roomChoice('letter-games', mode, level);
  return {
    mode: known(LETTER_MODE_IDS, choice.mode, 'first-vowel'),
    hints: choice.level !== 'no-hints',
    builderLevel: BUILDER_LEVELS.find(({ id }) => id === choice.level) ?? BUILDER_LEVELS[0],
  };
}

/** Turn the picture and Place the pieces in a room: look or memory, and the board size */
export interface RoomPicture {
  readonly mode: PictureModeId;
  readonly level: BoardLevel;
}

export function roomPicture(game: 'turn-picture' | 'place-pieces', mode: string, level: string): RoomPicture {
  const choice = roomChoice(game, mode, level);
  return {
    mode: known(PICTURE_MODE_IDS, choice.mode, 'look'),
    level: getPictureLevel(known(BOARD_LEVEL_IDS, choice.level, 'normal')),
  };
}

/** The sliding puzzle in a room: lines or a drawing, and the board size */
export interface RoomSliding {
  readonly pictureMode: PuzzlePictureMode;
  readonly level: BoardLevel;
}

export function roomSliding(mode: string, level: string): RoomSliding {
  const choice = roomChoice('sliding-puzzle', mode, level);
  return {
    pictureMode: known(PUZZLE_PICTURE_MODES, choice.mode, 'lines'),
    level: getPuzzleLevel(known(BOARD_LEVEL_IDS, choice.level, 'normal')),
  };
}

/**
 * The random numbers for one puzzle (or one set of letters) of a room round, from the round's seed and the puzzle's
 * number: the same on every device, whichever puzzle each player has reached
 */
export const roomRandom = (seed: number, index: number): Random => seededRandom(seed * 1009 + index);
