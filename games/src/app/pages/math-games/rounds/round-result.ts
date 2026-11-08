/**
 * What a round reports to the game once the player answers. Rounds first show the answer green or red for a moment
 * (see shared/answer-flash.ts): they emit `answering` right away, so a timed game can stop its clock, and `answered`
 * after.
 */
export interface RoundResult {
  readonly isCorrect: boolean;
  /** The player's answer as text, shown when it ends the game */
  readonly given: string;
}
