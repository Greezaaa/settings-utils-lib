/** A game of the site, listed on the home page */
export interface SmartGame {
  /** URL path, e.g. `math-games` */
  readonly slug: string;
  readonly name: string;
  /** One-line description */
  readonly summary: string;
  /** Who it's for, e.g. `Ages 6+` */
  readonly ages: string;
}

export const MATH_GAMES: SmartGame = {
  slug: 'math-games',
  name: 'Math games',
  summary:
    'True or false, tap the answer, or find the missing signs. With or without a timer, from sums up to 20 to three-digit division. In English, Spanish and Basque.',
  ages: 'Ages 6+',
};

/** All games, in the order they appear on the site */
export const SMART_GAMES: readonly SmartGame[] = [MATH_GAMES];
