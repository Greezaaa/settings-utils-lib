import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, ErrorHandler, inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { GamesApi } from './games-api';
import { siteErrorOf } from './site-error';

const MAX_REPORTS = 5;

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
    void this.injector.get(GamesApi).reportError(report);
  }
}
