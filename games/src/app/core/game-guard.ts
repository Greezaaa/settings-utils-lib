import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameAvailability } from './game-availability';
import { GameSlug } from './games';

/**
 * Lets a game's page open only when the game is open, or in preview; otherwise goes to the home page.
 * Always passes while prerendering, so every game's page is built.
 */
export const gameAvailableGuard =
  (game: GameSlug): CanActivateFn =>
  async () => {
    const availability = inject(GameAvailability);
    const router = inject(Router);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return true;
    }
    await availability.ready();
    return availability.canPlay(game) || router.parseUrl('/');
  };
