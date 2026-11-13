export interface Shape {
  readonly rows: number;
  readonly columns: number;
}

export type BoardLevelId = 'easy' | 'normal' | 'hard' | 'expert';

export interface BoardLevel extends Shape {
  readonly id: BoardLevelId;
}

export const cellCount = ({ rows, columns }: Shape): number => rows * columns;

export function getBoardLevel(levels: readonly BoardLevel[], id: BoardLevelId): BoardLevel {
  const level = levels.find((item) => item.id === id);
  if (!level) {
    throw new Error(`Unknown level: ${id}`);
  }
  return level;
}
