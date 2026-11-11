import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameAvailability } from './game-availability';
import { GameSlug } from './games';
import { SITE_UPDATES, SiteUpdate } from './site-updates';

/** How long a game is marked "New" after the update that added it */
export const NEW_GAME_DAYS = 14;
/** At most this many games are marked "New" at once, the most recent ones */
export const NEW_GAMES_LIMIT = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The games added in the last `days` days, newest first, at most `limit`, among those `isPublic` lets through
 * (a game hidden from the public is never the newest one).
 * A game is added by the first update that mentions it (site-updates.ts); within one update, later changes count
 * as newer.
 */
export function newGames(
  now: Date,
  updates: readonly SiteUpdate[] = SITE_UPDATES,
  days = NEW_GAME_DAYS,
  limit = NEW_GAMES_LIMIT,
  isPublic: (game: GameSlug) => boolean = () => true,
): GameSlug[] {
  const added = addedTimes(updates);
  return recentlyAdded(updates)
    .filter((game) => isPublic(game) && now.getTime() - (added.get(game) ?? 0) < days * DAY_MS)
    .slice(0, limit);
}

/** When each game was added: the time of the first update that mentions it */
function addedTimes(updates: readonly SiteUpdate[]): Map<GameSlug, number> {
  const added = new Map<GameSlug, number>();
  updates.forEach(({ published, changes }) =>
    changes.forEach(({ game }) => {
      if (game && !added.has(game)) {
        added.set(game, Date.parse(published));
      }
    }),
  );
  return added;
}

/** Every game an update added, newest first (within one update, later changes count as newer) */
export function recentlyAdded(updates: readonly SiteUpdate[] = SITE_UPDATES): GameSlug[] {
  const added = addedTimes(updates);
  return [...added.keys()].reverse().sort((first, second) => (added.get(second) ?? 0) - (added.get(first) ?? 0));
}

/**
 * The games to mark "New": the newest ones open to the public. Worked out in the browser after the first render,
 * from the visitor's clock, so the prerendered pages never go stale and hydration matches.
 */
@Injectable({ providedIn: 'root' })
export class NewGames {
  private readonly availability = inject(GameAvailability);
  /** The visitor's clock, read in the browser */
  private readonly now = signal<Date | null>(null);

  readonly games = computed<readonly GameSlug[]>(() => {
    const now = this.now();
    return now
      ? newGames(now, SITE_UPDATES, NEW_GAME_DAYS, NEW_GAMES_LIMIT, (game) => this.availability.isOpen(game))
      : [];
  });

  constructor() {
    afterNextRender(() => this.now.set(new Date()));
  }
}
