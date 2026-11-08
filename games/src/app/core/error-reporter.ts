import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, ErrorHandler, inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { GamesApi } from './games-api';
import { siteErrorOf } from './site-error';

/** Errors reported per page load at most, so a broken page can't send one after another */
const MAX_REPORTS = 5;

/**
 * Angular's error handler, which also reports each distinct error once per page load to the admin's error log (in the
 * browser only, and a few at most). Errors still show in the console as before.
 */
@Injectable()
export class ReportingErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly reported = new Set<string>();

  handleError(error: unknown): void {
    console.error(error);
    if (!this.isBrowser || this.reported.size >= MAX_REPORTS) {
      return;
    }
    const report = siteErrorOf(error, this.document.location.pathname);
    const key = `${report.title}\n${report.problem}\n${report.path}`;
    if (this.reported.has(key)) {
      return;
    }
    this.reported.add(key);
    // Looked up only now: the API service mustn't be built while the app itself is still starting
    void this.injector.get(GamesApi).reportError(report);
  }
}
