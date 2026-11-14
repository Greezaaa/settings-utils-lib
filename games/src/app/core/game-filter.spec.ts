import { describe, expect, it } from 'vitest';
import { filterGames, GameFacts, NO_FILTER, searchable } from './game-filter';
import { GameCategory, GameSlug } from './games';

const CATEGORIES: Partial<Record<GameSlug, readonly GameCategory[]>> = {
  'math-games': ['numbers'],
  'letter-games': ['letters'],
  'letter-sudoku': ['letters', 'puzzles'],
};
const TEXTS: Partial<Record<GameSlug, string>> = {
  'math-games': 'Juegos de matemáticas sumas y restas',
  'letter-games': 'Juegos de letras vocales',
  'letter-sudoku': 'Sudoku de letras',
};
const GAMES: readonly GameSlug[] = ['math-games', 'letter-games', 'letter-sudoku'];
const facts = (favorites: readonly GameSlug[] = []): GameFacts => ({
  categoriesOf: (game) => CATEGORIES[game] ?? [],
  textOf: (game) => TEXTS[game] ?? '',
  favorites,
});

describe('game filter', () => {
  it('shows every game without a filter', () => {
    expect(filterGames(GAMES, NO_FILTER, facts())).toEqual(GAMES);
  });

  it('searches names and subtitles, ignoring accents, capitals and word order', () => {
    expect(filterGames(GAMES, { ...NO_FILTER, query: 'MATEMATICAS' }, facts())).toEqual(['math-games']);
    expect(filterGames(GAMES, { ...NO_FILTER, query: 'letras sudoku' }, facts())).toEqual(['letter-sudoku']);
    expect(filterGames(GAMES, { ...NO_FILTER, query: 'ajedrez' }, facts())).toEqual([]);
  });

  it('keeps games of a category, including games in several', () => {
    expect(filterGames(GAMES, { ...NO_FILTER, category: 'puzzles' }, facts())).toEqual(['letter-sudoku']);
    expect(filterGames(GAMES, { ...NO_FILTER, category: 'letters' }, facts())).toEqual(['letter-games', 'letter-sudoku']);
  });

  it('combines favourites with the category', () => {
    const filter = { ...NO_FILTER, category: 'letters' as const, favoritesOnly: true };
    expect(filterGames(GAMES, filter, facts(['letter-sudoku', 'math-games']))).toEqual(['letter-sudoku']);
  });

  it('makes text searchable', () => {
    expect(searchable('  Árbol Ñandú ')).toBe('arbol nandu');
  });
});
