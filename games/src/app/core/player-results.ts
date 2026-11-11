import { GameSlug } from './games';

/**
 * Games that keep best results, where each keeps them in this browser (an object of settings key → best, e.g.
 * `{ "which-one:normal": 12 }`), and which way is better. A signed-in player's results also go to their account, which
 * the leaderboard ranks. Keep in sync with RESULT_DIRECTIONS in api/src/shared/catalog.ts.
 */
export type ResultGame = Extract<
  GameSlug,
  'math-games' | 'climb-tower' | 'find-pairs' | 'sliding-puzzle' | 'turn-picture' | 'place-pieces'
>;

export interface ResultBoard {
  /** Where the page keeps its best results in this browser */
  readonly storage: string;
  /** A higher score is better, or fewer moves or seconds */
  readonly better: 'higher' | 'lower';
}

export const RESULT_GAMES: Readonly<Record<ResultGame, ResultBoard>> = {
  'math-games': { storage: 'math-games:best', better: 'higher' },
  'climb-tower': { storage: 'climb-tower:best', better: 'higher' },
  'find-pairs': { storage: 'find-pairs:best', better: 'lower' },
  'sliding-puzzle': { storage: 'sliding-puzzle:best-moves', better: 'lower' },
  'turn-picture': { storage: 'turn-picture:best-seconds', better: 'lower' },
  'place-pieces': { storage: 'place-pieces:best-seconds', better: 'lower' },
};

export const RESULT_GAME_SLUGS = Object.keys(RESULT_GAMES).filter((slug): slug is ResultGame => slug in RESULT_GAMES);

export const isResultGame = (game: string): game is ResultGame => RESULT_GAME_SLUGS.some((slug) => slug === game);

/** One best result: a game, its settings key and the value */
export interface BestResult {
  readonly game: ResultGame;
  readonly key: string;
  readonly value: number;
}

/** Whether `value` beats `than` for a game (a first result always does) */
export function isBetter(game: ResultGame, value: number, than: number | undefined): boolean {
  if (than === undefined) {
    return true;
  }
  return RESULT_GAMES[game].better === 'higher' ? value > than : value < than;
}

/** A game's stored bests as they are in this browser: only whole, non-negative numbers */
export function storedBests(game: ResultGame, stored: unknown): BestResult[] {
  if (typeof stored !== 'object' || stored === null) {
    return [];
  }
  return Object.entries(stored).flatMap(([key, value]: [string, unknown]) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 0 ? [{ game, key, value }] : [],
  );
}

/** A game's stored bests with others added (e.g. the account's), keeping the better of each */
export function mergedBests(
  game: ResultGame,
  stored: unknown,
  others: readonly BestResult[],
): Readonly<Record<string, number>> {
  const merged: Record<string, number> = {};
  for (const { key, value } of [...storedBests(game, stored), ...others.filter((best) => best.game === game)]) {
    if (isBetter(game, value, merged[key])) {
      merged[key] = value;
    }
  }
  return merged;
}

/** This browser's bests that beat the account's, so a sign-in or a visit sends only what the account lacks */
export function bestsToSend(local: readonly BestResult[], account: readonly BestResult[]): BestResult[] {
  const accountBest = new Map(account.map(({ game, key, value }) => [`${game}\n${key}`, value]));
  return local.filter(({ game, key, value }) => isBetter(game, value, accountBest.get(`${game}\n${key}`)));
}
