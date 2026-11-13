import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameAvailability } from './game-availability';
import { GameSlug } from './games';

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
