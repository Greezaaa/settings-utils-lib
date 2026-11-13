import { BoardLevel, BoardLevelId, getBoardLevel } from './board';

export type PictureModeId = 'look' | 'memory';

export const PICTURE_MODE_IDS: readonly PictureModeId[] = ['look', 'memory'];

export type PicturePhase = 'preview' | 'playing' | 'solved';

export const PICTURE_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 2, columns: 2 },
  { id: 'normal', rows: 3, columns: 3 },
  { id: 'hard', rows: 4, columns: 4 },
  { id: 'expert', rows: 5, columns: 5 },
];

export const getPictureLevel = (id: BoardLevelId): BoardLevel => getBoardLevel(PICTURE_LEVELS, id);
