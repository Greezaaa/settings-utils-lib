import { PictureWord } from './letter-games';
import { pick, Random, shuffled } from './random';

/**
 * Word search: rules only, no Angular, so they can be tested on their own. Picture words hide in a square of letters,
 * along straight lines; the player marks each one by drawing from its first letter to its last. Harder levels have a
 * bigger board, more words and more directions to read in.
 */

/** A step from one cell to the next along a line: rows and columns, each -1, 0 or 1 */
export interface Direction {
  readonly rows: number;
  readonly columns: number;
}

const RIGHT: Direction = { rows: 0, columns: 1 };
const DOWN: Direction = { rows: 1, columns: 0 };
const DOWN_RIGHT: Direction = { rows: 1, columns: 1 };
const UP_RIGHT: Direction = { rows: -1, columns: 1 };
/** Every direction, backwards too */
const ALL_DIRECTIONS: readonly Direction[] = [RIGHT, DOWN, DOWN_RIGHT, UP_RIGHT].flatMap((step) => [
  step,
  { rows: -step.rows, columns: -step.columns },
]);

export type SearchLevelId = 'easy' | 'normal' | 'hard';

export interface SearchLevel {
  readonly id: SearchLevelId;
  /** Rows, and columns */
  readonly size: number;
  readonly wordCount: number;
  readonly directions: readonly Direction[];
}

export const SEARCH_LEVELS: readonly SearchLevel[] = [
  { id: 'easy', size: 6, wordCount: 4, directions: [RIGHT, DOWN] },
  { id: 'normal', size: 8, wordCount: 6, directions: [RIGHT, DOWN, DOWN_RIGHT] },
  { id: 'hard', size: 10, wordCount: 8, directions: ALL_DIRECTIONS },
];

export const DEFAULT_SEARCH_LEVEL: SearchLevelId = 'easy';

/** Shortest word hidden, so filler letters rarely spell one by chance */
const MIN_HIDDEN_LENGTH = 3;
/** Tries to fit each word before choosing another */
const PLACE_TRIES = 60;

/** A word in the board and the cells it covers, from its first letter to its last */
export interface HiddenWord {
  readonly word: PictureWord;
  readonly cells: readonly number[];
}

export interface WordSearch {
  readonly size: number;
  /** One letter per cell, in row order */
  readonly letters: readonly string[];
  /** In the order the player sees them listed */
  readonly words: readonly HiddenWord[];
}

export function getSearchLevel(id: SearchLevelId): SearchLevel {
  const level = SEARCH_LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

/**
 * A new board: picture words placed one by one in random places and directions (crossing only where they share a
 * letter), then every other cell filled with letters from the same words, so the board looks like the language
 */
export function createWordSearch(level: SearchLevel, pictures: readonly PictureWord[], random: Random): WordSearch {
  const { size } = level;
  const board: (string | null)[] = Array<string | null>(size * size).fill(null);
  const words: HiddenWord[] = [];
  const candidates = shuffled(uniqueWords(pictures), random).filter(
    ({ word }) => word.length >= MIN_HIDDEN_LENGTH && word.length <= size,
  );
  for (const word of candidates) {
    if (words.length === level.wordCount) {
      break;
    }
    const letters = Array.from(word.word);
    const cells = findPlace(board, size, letters, level.directions, random);
    if (cells) {
      cells.forEach((cell, index) => (board[cell] = letters[index]));
      words.push({ word, cells });
    }
  }
  const alphabet = [...new Set(pictures.flatMap(({ word }) => Array.from(word)))];
  return { size, letters: board.map((letter) => letter ?? pick(alphabet, random)), words };
}

/** The cells of a straight line (across, down or diagonal) from one cell to another, both included; null otherwise */
export function lineCells(from: number, to: number, size: number): number[] | null {
  const [fromRow, fromColumn, toRow, toColumn] = [Math.floor(from / size), from % size, Math.floor(to / size), to % size];
  const [rows, columns] = [toRow - fromRow, toColumn - fromColumn];
  if (rows !== 0 && columns !== 0 && Math.abs(rows) !== Math.abs(columns)) {
    return null;
  }
  const length = Math.max(Math.abs(rows), Math.abs(columns)) + 1;
  const step = Math.sign(rows) * size + Math.sign(columns);
  return Array.from({ length }, (_, index) => from + index * step);
}

/** The hidden word, not found yet, that a line of cells spells, read either way; null when there's none */
export function wordAt(
  search: WordSearch,
  cells: readonly number[],
  found: ReadonlySet<string>,
): HiddenWord | null {
  const text = cells.map((cell) => search.letters[cell]).join('');
  const backwards = Array.from(text).reverse().join('');
  return (
    search.words.find(({ word }) => !found.has(word.word) && (word.word === text || word.word === backwards)) ?? null
  );
}

/** Pictures with the same word appear once (the last one) */
function uniqueWords(pictures: readonly PictureWord[]): PictureWord[] {
  const byWord = new Map(pictures.map((picture) => [picture.word, picture]));
  return [...byWord.values()];
}

/** Cells where a word fits in one of the directions, or null after enough tries */
function findPlace(
  board: readonly (string | null)[],
  size: number,
  letters: readonly string[],
  directions: readonly Direction[],
  random: Random,
): number[] | null {
  for (let tries = 0; tries < PLACE_TRIES; tries++) {
    const direction = pick(directions, random);
    const [row, column] = [Math.floor(random() * size), Math.floor(random() * size)];
    const cells = letters.map((_, index) => [row + index * direction.rows, column + index * direction.columns]);
    const fits = cells.every(
      ([cellRow, cellColumn], index) =>
        cellRow >= 0 &&
        cellRow < size &&
        cellColumn >= 0 &&
        cellColumn < size &&
        [null, letters[index]].includes(board[cellRow * size + cellColumn]),
    );
    if (fits) {
      return cells.map(([cellRow, cellColumn]) => cellRow * size + cellColumn);
    }
  }
  return null;
}
