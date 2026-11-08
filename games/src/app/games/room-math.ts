import { createSignsPuzzle, getSignsLevel, SIGNS_LEVELS, SignsLevel, SignsPuzzle } from './find-the-signs';
import { ANSWER_STYLE_IDS, AnswerStyleId, createQuestion, getLevel, Level, LEVELS, LevelId, Question } from './math-games';
import { seededRandom } from './random';

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

/** One exercise of a room round: a question, or a Find the signs puzzle */
export type RoomExercise = { readonly question: Question } | { readonly puzzle: SignsPuzzle };

/** More exercises than anyone can answer in the longest round (2 minutes at 3 answers a second) */
export const ROOM_EXERCISE_COUNT = 400;

/**
 * Every exercise of a room round, in order, from the round's seed: the same list on every device. Built once when the
 * round starts; each player then moves through it at their own pace.
 */
export function roomExercises(math: RoomMath, seed: number, count = ROOM_EXERCISE_COUNT): RoomExercise[] {
  const random = seededRandom(seed);
  return Array.from(
    { length: count },
    (): RoomExercise =>
      math.style === 'find-the-signs'
        ? { puzzle: createSignsPuzzle(signsLevelOf(math), random) }
        : { question: createQuestion(questionLevelOf(math), random) },
  );
}
