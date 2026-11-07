import { afterNextRender, Injectable, signal } from '@angular/core';
import { GameSlug } from './games';
import { SITE_UPDATES, SiteUpdate } from './site-updates';

/** How long a game is marked "New" after the update that added it */
export const NEW_GAME_DAYS = 14;
/** At most this many games are marked "New" at once, the most recent ones */
export const NEW_GAMES_LIMIT = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The games added in the last `days` days, newest first, at most `limit`.
 * A game is added by the first update that mentions it (site-updates.ts); within one update, later changes count
 * as newer.
 */
export function newGames(
  now: Date,
  updates: readonly SiteUpdate[] = SITE_UPDATES,
  days = NEW_GAME_DAYS,
  limit = NEW_GAMES_LIMIT,
): GameSlug[] {
  const added = new Map<GameSlug, number>();
  updates.forEach(({ published, changes }) =>
    changes.forEach(({ game }) => {
      if (game && !added.has(game)) {
        added.set(game, Date.parse(published));
      }
    }),
  );
  const order = [...added.keys()];
  return order
    .filter((game) => now.getTime() - (added.get(game) ?? 0) < days * DAY_MS)
    .reverse()
    .sort((first, second) => (added.get(second) ?? 0) - (added.get(first) ?? 0))
    .slice(0, limit);
}

/**
 * The games to mark "New". Worked out in the browser after the first render, from the visitor's clock, so the
 * prerendered pages never go stale and hydration matches.
 */
@Injectable({ providedIn: 'root' })
export class NewGames {
  private readonly slugs = signal<readonly GameSlug[]>([]);

  readonly games = this.slugs.asReadonly();

  constructor() {
    afterNextRender(() => this.slugs.set(newGames(new Date())));
  }
}
