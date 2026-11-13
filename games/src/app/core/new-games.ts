import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { GameAvailability } from './game-availability';
import { GameSlug } from './games';
import { SITE_UPDATES, SiteUpdate } from './site-updates';

export const NEW_GAME_DAYS = 14;
export const NEW_GAMES_LIMIT = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

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

export function recentlyAdded(updates: readonly SiteUpdate[] = SITE_UPDATES): GameSlug[] {
  const added = addedTimes(updates);
  return [...added.keys()].reverse().sort((first, second) => (added.get(second) ?? 0) - (added.get(first) ?? 0));
}

@Injectable({ providedIn: 'root' })
export class NewGames {
  private readonly availability = inject(GameAvailability);
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
