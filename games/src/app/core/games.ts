/** URL path of each game; their names and descriptions are translated in i18n/ */
export type GameSlug =
  | 'math-games'
  | 'letter-games'
  | 'hit-the-note'
  | 'sliding-puzzle'
  | 'turn-picture'
  | 'place-pieces';

/** What a game trains; the home page lists the games by category, in this order */
export type GameCategory = 'numbers' | 'letters' | 'music' | 'puzzles';
export const GAME_CATEGORIES: readonly GameCategory[] = ['numbers', 'letters', 'music', 'puzzles'];

export interface GameInfo {
  readonly slug: GameSlug;
  readonly category: GameCategory;
  /** The youngest age it is recommended from, shown as e.g. "Ages 4+" */
  readonly minAge: number;
}

/** All games, in the order they appear on the site */
export const GAMES: readonly GameInfo[] = [
  { slug: 'math-games', category: 'numbers', minAge: 6 },
  { slug: 'letter-games', category: 'letters', minAge: 4 },
  { slug: 'hit-the-note', category: 'music', minAge: 4 },
  { slug: 'sliding-puzzle', category: 'puzzles', minAge: 5 },
  { slug: 'turn-picture', category: 'puzzles', minAge: 4 },
  { slug: 'place-pieces', category: 'puzzles', minAge: 4 },
];

export const GAME_SLUGS: readonly GameSlug[] = GAMES.map(({ slug }) => slug);

/** A game's details */
export function gameInfo(slug: GameSlug): GameInfo {
  const game = GAMES.find((info) => info.slug === slug);
  if (!game) {
    throw new Error(`Unknown game: ${slug}`);
  }
  return game;
}

/** The games of each category that has any, in site order */
export const GAMES_BY_CATEGORY: readonly { readonly category: GameCategory; readonly games: readonly GameSlug[] }[] =
  GAME_CATEGORIES.map((category) => ({
    category,
    games: GAMES.filter((game) => game.category === category).map(({ slug }) => slug),
  })).filter(({ games }) => games.length > 0);
