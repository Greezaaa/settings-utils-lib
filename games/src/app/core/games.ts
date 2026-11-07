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
  /**
   * Whether the game is open to the public until the admin switches it (see GameAvailability), and whenever the API
   * can't be reached. Add a new game with `false` to try it in preview before opening it.
   */
  readonly openByDefault: boolean;
}

/** All games, in the order they appear on the site */
export const GAMES: readonly GameInfo[] = [
  { slug: 'math-games', category: 'numbers', minAge: 6, openByDefault: true },
  { slug: 'letter-games', category: 'letters', minAge: 4, openByDefault: true },
  { slug: 'hit-the-note', category: 'music', minAge: 4, openByDefault: true },
  { slug: 'sliding-puzzle', category: 'puzzles', minAge: 5, openByDefault: true },
  { slug: 'turn-picture', category: 'puzzles', minAge: 4, openByDefault: true },
  { slug: 'place-pieces', category: 'puzzles', minAge: 4, openByDefault: true },
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

export interface CategoryGames {
  readonly category: GameCategory;
  readonly games: readonly GameSlug[];
}

/** The given games grouped by category, in site order, leaving out empty categories */
export function byCategory(games: readonly GameSlug[]): CategoryGames[] {
  return GAME_CATEGORIES.map((category) => ({
    category,
    games: games.filter((game) => gameInfo(game).category === category),
  })).filter((group) => group.games.length > 0);
}

/** The game a page address belongs to, e.g. `/letter-games/` → `letter-games`; null for other pages */
export function gameOfPath(path: string): GameSlug | null {
  const firstSegment = path.split(/[/?#]/).find(Boolean) ?? '';
  return GAME_SLUGS.find((slug) => slug === firstSegment) ?? null;
}
