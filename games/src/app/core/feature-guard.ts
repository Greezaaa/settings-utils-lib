import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlags } from './feature-flags';
import { FeatureId } from './features';

export const featureGuard =
  (feature: FeatureId): CanActivateFn =>
  async () => {
    const flags = inject(FeatureFlags);
    const router = inject(Router);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return true;
    }
    await flags.ready();
    return flags.canUse(feature) || router.parseUrl('/');
  };
