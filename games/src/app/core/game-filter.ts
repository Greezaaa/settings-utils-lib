import { GameCategory, GameSlug } from './games';

export type CategoryFilter = GameCategory | 'all';

export interface GameFilter {
  readonly query: string;
  readonly category: CategoryFilter;
  readonly favoritesOnly: boolean;
}

export interface GameFacts {
  readonly categoriesOf: (game: GameSlug) => readonly GameCategory[];
  readonly textOf: (game: GameSlug) => string;
  readonly favorites: readonly GameSlug[];
}

export const NO_FILTER: GameFilter = { query: '', category: 'all', favoritesOnly: false };

export const searchable = (text: string): string =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export function filterGames(games: readonly GameSlug[], filter: GameFilter, facts: GameFacts): GameSlug[] {
  const words = searchable(filter.query).split(/\s+/).filter(Boolean);
  return games.filter(
    (game) =>
      (filter.category === 'all' || facts.categoriesOf(game).includes(filter.category)) &&
      (!filter.favoritesOnly || facts.favorites.includes(game)) &&
      words.every((word) => searchable(facts.textOf(game)).includes(word)),
  );
}
