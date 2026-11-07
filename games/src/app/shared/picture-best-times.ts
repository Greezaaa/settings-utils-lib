import { readStored, writeStored } from '../core/site-storage';
import { BoardLevelId } from '../games/board';
import { PICTURE_LEVELS, PICTURE_MODE_IDS, PictureModeId } from '../games/picture-game';

/** Best times of a picture game are kept apart for each mode and size, e.g. `memory:hard` */
export type PictureScoreKey = `${PictureModeId}:${BoardLevelId}`;
export type BestTimes = Partial<Record<PictureScoreKey, number>>;

export const pictureScoreKey = (mode: PictureModeId, level: BoardLevelId): PictureScoreKey => `${mode}:${level}`;

/** Best times saved under `storage`, keeping only known keys with whole numbers of seconds */
export function readBestTimes(storage: string): BestTimes {
  const stored = readStored(storage);
  if (typeof stored !== 'object' || stored === null) {
    return {};
  }
  const times: BestTimes = {};
  for (const mode of PICTURE_MODE_IDS) {
    for (const { id } of PICTURE_LEVELS) {
      const key = pictureScoreKey(mode, id);
      const value: unknown = Reflect.get(stored, key);
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
        times[key] = value;
      }
    }
  }
  return times;
}

export function writeBestTimes(storage: string, times: BestTimes): void {
  writeStored(storage, times);
}
