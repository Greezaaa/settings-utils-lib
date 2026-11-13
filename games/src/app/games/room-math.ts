import { createSignsPuzzle, getSignsLevel, SIGNS_LEVELS, SignsLevel, SignsPuzzle } from './find-the-signs';
import { ANSWER_STYLE_IDS, AnswerStyleId, createQuestion, getLevel, Level, LEVELS, LevelId, Question } from './math-games';
import { seededRandom } from './random';

export interface RoomMath {
  readonly style: AnswerStyleId;
  readonly levelId: LevelId;
}

const DEFAULT_ROOM_MATH: RoomMath = { style: 'true-or-false', levelId: 'normal' };

export const levelIdsFor = (style: AnswerStyleId): readonly LevelId[] =>
  (style === 'find-the-signs' ? SIGNS_LEVELS : LEVELS).map(({ id }) => id);

export function roomMath(mode: string, level: string): RoomMath {
  const style = ANSWER_STYLE_IDS.find((id) => id === mode) ?? DEFAULT_ROOM_MATH.style;
  const levelId = levelIdsFor(style).find((id) => id === level) ?? DEFAULT_ROOM_MATH.levelId;
  return { style, levelId };
}

export const signsLevelOf = ({ levelId }: RoomMath): SignsLevel => getSignsLevel(levelId);

export const questionLevelOf = ({ levelId }: RoomMath): Level => getLevel(levelId);

export type RoomExercise = { readonly question: Question } | { readonly puzzle: SignsPuzzle };

export const ROOM_EXERCISE_COUNT = 400;

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
