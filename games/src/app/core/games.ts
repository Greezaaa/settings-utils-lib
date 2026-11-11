/** URL path of each game; their names and descriptions are translated in i18n/ */
export type GameSlug =
  | 'math-games'
  | 'measure-it'
  | 'climb-tower'
  | 'letter-games'
  | 'hit-the-note'
  | 'sliding-puzzle'
  | 'turn-picture'
  | 'place-pieces'
  | 'find-pairs'
  | 'how-many';

/** What a game trains; the home page lists the games by category, in this order */
export type GameCategory = 'numbers' | 'letters' | 'music' | 'puzzles';
export const GAME_CATEGORIES: readonly GameCategory[] = [
  'numbers',
  'letters',
  'music',
  'puzzles',
];

export interface GameInfo {
  readonly slug: GameSlug;
  readonly category: GameCategory;
  /** The youngest age it is recommended from, shown as e.g. "Ages 4+" */
  readonly minAge: number;
  /**
   * Whether the game is open to the public until the admin switches it (see GameAvailability), and whenever the API
   * can't be reached. Add a new game with `false` to try it in preview before opening it; once it's open to the public,
   * set `true`, so prerendered pages (which list the defaults) match what visitors get.
   */
  readonly openByDefault: boolean;
  /** A small picture of the game, for lists like the room's choice of game */
  readonly icon: string;
}

/** All games, in the order they appear on the site */
export const GAMES: readonly GameInfo[] = [
  {
    slug: 'math-games',
    category: 'numbers',
    minAge: 6,
    openByDefault: true,
    icon: '🔢',
  },
  {
    slug: 'measure-it',
    category: 'numbers',
    minAge: 7,
    openByDefault: true,
    icon: '📐',
  },
  {
    slug: 'climb-tower',
    category: 'numbers',
    minAge: 6,
    openByDefault: true,
    icon: '🧗',
  },
  {
    slug: 'letter-games',
    category: 'letters',
    minAge: 4,
    openByDefault: true,
    icon: '🔤',
  },
  {
    slug: 'hit-the-note',
    category: 'music',
    minAge: 4,
    openByDefault: false,
    icon: '🎵',
  },
  {
    slug: 'sliding-puzzle',
    category: 'puzzles',
    minAge: 5,
    openByDefault: true,
    icon: '🧩',
  },
  {
    slug: 'turn-picture',
    category: 'puzzles',
    minAge: 4,
    openByDefault: true,
    icon: '🔄',
  },
  {
    slug: 'place-pieces',
    category: 'puzzles',
    minAge: 4,
    openByDefault: true,
    icon: '🖼️',
  },
  {
    slug: 'find-pairs',
    category: 'puzzles',
    minAge: 4,
    openByDefault: true,
    icon: '🃏',
  },
  {
    slug: 'how-many',
    category: 'numbers',
    minAge: 3,
    openByDefault: false,
    icon: '🖐️',
  },
];

export const GAME_SLUGS: readonly GameSlug[] = GAMES.map(({ slug }) => slug);

export function gameInfo(slug: GameSlug): GameInfo {
  const game = GAMES.find(info => info.slug === slug);
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
  return GAME_CATEGORIES.map(category => ({
    category,
    games: games.filter(game => gameInfo(game).category === category),
  })).filter(group => group.games.length > 0);
}

/** The game a page address belongs to, e.g. `/letter-games/` → `letter-games`; null for other pages */
export function gameOfPath(path: string): GameSlug | null {
  const firstSegment = path.split(/[/?#]/).find(Boolean) ?? '';
  return GAME_SLUGS.find(slug => slug === firstSegment) ?? null;
}
