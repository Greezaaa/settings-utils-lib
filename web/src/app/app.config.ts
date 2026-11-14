import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { PageMetaStrategy } from './core/page-meta';
import { PageTransition } from './core/page-transition';
import { setUpSite } from './core/site-setup';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => inject(PageTransition).prepare(transition),
      }),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    { provide: TitleStrategy, useClass: PageMetaStrategy },
    provideAppInitializer(setUpSite),
  ],
};
