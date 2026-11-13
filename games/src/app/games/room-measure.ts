import { MEASURE_LEVEL_IDS, MEASURE_MODE_IDS, MeasureExercise, measureExercises, MeasureLevelId, MeasureModeId } from './measure-it';
import { seededRandom } from './random';

export interface RoomMeasure {
  readonly mode: MeasureModeId;
  readonly levelId: MeasureLevelId;
}

export function roomMeasure(mode: string, level: string): RoomMeasure {
  return {
    mode: MEASURE_MODE_IDS.find(id => id === mode) ?? MEASURE_MODE_IDS[0],
    levelId: MEASURE_LEVEL_IDS.find(id => id === level) ?? MEASURE_LEVEL_IDS[0],
  };
}

export const ROOM_MEASURE_COUNT = 120;

export const roomMeasureExercises = (
  { mode, levelId }: RoomMeasure,
  seed: number
): MeasureExercise[] =>
  measureExercises(mode, levelId, seededRandom(seed), ROOM_MEASURE_COUNT);
