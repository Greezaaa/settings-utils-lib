import { DOCUMENT, inject, Injectable } from '@angular/core';

export const TICK_MS = 60_000;

export interface CheckTiming {
  readonly everyMs: number;
  readonly minGapMs: number;
}

interface Check extends CheckTiming {
  readonly run: () => void;
  lastRun: number;
}

@Injectable({ providedIn: 'root' })
export class BackgroundChecks {
  private readonly document = inject(DOCUMENT);
  private readonly checks = new Set<Check>();
  private isListening = false;

  add(run: () => void, timing: CheckTiming, now = Date.now()): () => void {
    const check: Check = { ...timing, run, lastRun: now };
    this.checks.add(check);
    this.listen();
    return () => this.checks.delete(check);
  }

  runDue(reason: 'visible' | 'tick', now = Date.now()): void {
    if (this.document.visibilityState !== 'visible') {
      return;
    }
    for (const check of this.checks) {
      const wait = reason === 'visible' ? check.minGapMs : check.everyMs;
      if (now - check.lastRun >= wait) {
        check.lastRun = now;
        check.run();
      }
    }
  }

  private listen(): void {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    this.document.addEventListener('visibilitychange', () => this.runDue('visible'));
    this.document.defaultView?.setInterval(() => this.runDue('tick'), TICK_MS);
  }
}
