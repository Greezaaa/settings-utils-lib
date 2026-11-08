import { getSignsLevel, SIGNS_LEVELS, SignsLevel } from './find-the-signs';
import { ANSWER_STYLE_IDS, AnswerStyleId, getLevel, Level, LEVELS, LevelId } from './math-games';

/** Math in a room: the answer style and level the host picked, checked against the math games */
export interface RoomMath {
  readonly style: AnswerStyleId;
  readonly levelId: LevelId;
}

const DEFAULT_ROOM_MATH: RoomMath = { style: 'true-or-false', levelId: 'normal' };

/** The levels an answer style offers: Find the signs has its own */
export const levelIdsFor = (style: AnswerStyleId): readonly LevelId[] =>
  (style === 'find-the-signs' ? SIGNS_LEVELS : LEVELS).map(({ id }) => id);

/**
 * The room's math settings from the ids the rooms service passed on; anything unknown (an older or newer site, or a
 * tampered message) falls back to a level that exists
 */
export function roomMath(mode: string, level: string): RoomMath {
  const style = ANSWER_STYLE_IDS.find((id) => id === mode) ?? DEFAULT_ROOM_MATH.style;
  const levelId = levelIdsFor(style).find((id) => id === level) ?? DEFAULT_ROOM_MATH.levelId;
  return { style, levelId };
}

/** The level rules for Find the signs (roomMath only gives it levels Find the signs has) */
export const signsLevelOf = ({ levelId }: RoomMath): SignsLevel => getSignsLevel(levelId);

/** The level rules for True or false and Your answer */
export const questionLevelOf = ({ levelId }: RoomMath): Level => getLevel(levelId);
