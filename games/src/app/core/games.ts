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
  | 'how-many'
  | 'letter-sudoku'
  | 'number-sudoku'
  | 'word-search'
  | 'secret-word';

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
  readonly minAge: number;
  readonly openByDefault: boolean;
  readonly icon: string;
}

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
  {
    slug: 'letter-sudoku',
    category: 'letters',
    minAge: 5,
    openByDefault: false,
    icon: '🔠',
  },
  {
    slug: 'number-sudoku',
    category: 'numbers',
    minAge: 5,
    openByDefault: false,
    icon: '9️⃣',
  },
  {
    slug: 'word-search',
    category: 'letters',
    minAge: 6,
    openByDefault: false,
    icon: '🔍',
  },
  {
    slug: 'secret-word',
    category: 'letters',
    minAge: 6,
    openByDefault: false,
    icon: '🔐',
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

export function byCategory(games: readonly GameSlug[]): CategoryGames[] {
  return GAME_CATEGORIES.map(category => ({
    category,
    games: games.filter(game => gameInfo(game).category === category),
  })).filter(group => group.games.length > 0);
}

export function gameOfPath(path: string): GameSlug | null {
  const firstSegment = path.split(/[/?#]/).find(Boolean) ?? '';
  return GAME_SLUGS.find(slug => slug === firstSegment) ?? null;
}
