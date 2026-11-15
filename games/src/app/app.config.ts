import { ApplicationConfig, ErrorHandler, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withPreloading, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { ReportingErrorHandler } from './core/error-reporter';
import { LinkPreload } from './core/link-preload';
import { PageMetaStrategy } from './core/page-meta';
import { PageTransition } from './core/page-transition';
import { setUpSite } from './core/site-setup';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withComponentInputBinding(),
      withPreloading(LinkPreload),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => inject(PageTransition).prepare(transition),
      }),
    ),
    provideClientHydration(withEventReplay()),
    { provide: TitleStrategy, useClass: PageMetaStrategy },
    provideAppInitializer(setUpSite),
    { provide: ErrorHandler, useClass: ReportingErrorHandler },
  ],
};
