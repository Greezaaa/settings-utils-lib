/**
 * What the picture games ("Turn the picture", "Place the pieces") share: their modes and square board sizes.
 */

import { BoardLevel, BoardLevelId, getBoardLevel } from './board';

/** Look: the picture stays visible to compare. Memory: it shows only until the player is ready. */
export type PictureModeId = 'look' | 'memory';

export const PICTURE_MODE_IDS: readonly PictureModeId[] = ['look', 'memory'];

/** Square boards, from 2 × 2 to 5 × 5 */
export const PICTURE_LEVELS: readonly BoardLevel[] = [
  { id: 'easy', rows: 2, columns: 2 },
  { id: 'normal', rows: 3, columns: 3 },
  { id: 'hard', rows: 4, columns: 4 },
  { id: 'expert', rows: 5, columns: 5 },
];

export const getPictureLevel = (id: BoardLevelId): BoardLevel => getBoardLevel(PICTURE_LEVELS, id);
