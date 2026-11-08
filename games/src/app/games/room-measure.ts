import { MEASURE_LEVEL_IDS, MEASURE_MODE_IDS, MeasureExercise, measureExercises, MeasureLevelId, MeasureModeId } from './measure-it';
import { seededRandom } from './random';

/** Measure it in a room: the mode and level the host picked, checked against the game */
export interface RoomMeasure {
  readonly mode: MeasureModeId;
  readonly levelId: MeasureLevelId;
}

/**
 * The room's settings from the ids the rooms service passed on; anything unknown (an older or newer site, or a
 * tampered message) falls back to the first mode and level
 */
export function roomMeasure(mode: string, level: string): RoomMeasure {
  return {
    mode: MEASURE_MODE_IDS.find(id => id === mode) ?? MEASURE_MODE_IDS[0],
    levelId: MEASURE_LEVEL_IDS.find(id => id === level) ?? MEASURE_LEVEL_IDS[0],
  };
}

/** More exercises than anyone can answer in the longest round (2 minutes, with a pause after each answer) */
export const ROOM_MEASURE_COUNT = 120;

/** Every exercise of a room round, in order, from the round's seed: the same list on every device */
export const roomMeasureExercises = (
  { mode, levelId }: RoomMeasure,
  seed: number
): MeasureExercise[] =>
  measureExercises(mode, levelId, seededRandom(seed), ROOM_MEASURE_COUNT);
