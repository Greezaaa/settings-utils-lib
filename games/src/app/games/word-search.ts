import { PictureWord } from './letter-games';
import { pick, Random, shuffled } from './random';

export interface Direction {
  readonly rows: number;
  readonly columns: number;
}

const RIGHT: Direction = { rows: 0, columns: 1 };
const DOWN: Direction = { rows: 1, columns: 0 };
const DOWN_RIGHT: Direction = { rows: 1, columns: 1 };
const UP_RIGHT: Direction = { rows: -1, columns: 1 };
const ALL_DIRECTIONS: readonly Direction[] = [RIGHT, DOWN, DOWN_RIGHT, UP_RIGHT].flatMap((step) => [
  step,
  { rows: -step.rows, columns: -step.columns },
]);

export type SearchLevelId = 'easy' | 'normal' | 'hard';

export interface SearchLevel {
  readonly id: SearchLevelId;
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

const MIN_HIDDEN_LENGTH = 3;
const PLACE_TRIES = 60;

export interface HiddenWord {
  readonly word: PictureWord;
  readonly cells: readonly number[];
}

export interface WordSearch {
  readonly size: number;
  readonly letters: readonly string[];
  readonly words: readonly HiddenWord[];
}

export function getSearchLevel(id: SearchLevelId): SearchLevel {
  const level = SEARCH_LEVELS.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}

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

function uniqueWords(pictures: readonly PictureWord[]): PictureWord[] {
  const byWord = new Map(pictures.map((picture) => [picture.word, picture]));
  return [...byWord.values()];
}

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
