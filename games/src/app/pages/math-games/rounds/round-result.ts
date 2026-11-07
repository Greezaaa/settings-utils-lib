/** What a round reports to the game once the player answers */
export interface RoundResult {
  readonly isCorrect: boolean;
  /** The player's answer as text, shown when it ends the game */
  readonly given: string;
}
