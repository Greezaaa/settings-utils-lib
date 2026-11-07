/** URL path of each game; their names and descriptions are translated in i18n/ */
export type GameSlug = 'math-games' | 'sliding-puzzle' | 'turn-picture';

/** All games, in the order they appear on the site */
export const GAME_SLUGS: readonly GameSlug[] = ['math-games', 'sliding-puzzle', 'turn-picture'];
