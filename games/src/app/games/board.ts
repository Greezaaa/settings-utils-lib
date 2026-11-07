/** Size of a board, in tiles */
export interface Shape {
  readonly rows: number;
  readonly columns: number;
}

/** Levels of the board games (names and descriptions are translated by the pages) */
export type BoardLevelId = 'easy' | 'normal' | 'hard' | 'expert';

/** A level of a board game: the size of its board */
export interface BoardLevel extends Shape {
  readonly id: BoardLevelId;
}

export const cellCount = ({ rows, columns }: Shape): number => rows * columns;

/** The level with this id; levels only ever hold ids from their own list */
export function getBoardLevel(levels: readonly BoardLevel[], id: BoardLevelId): BoardLevel {
  const level = levels.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}
