import { DOCUMENT, Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { BackgroundChecks } from './background-checks';

function checksOn(visibility: DocumentVisibilityState): BackgroundChecks {
  const page: Pick<Document, 'visibilityState' | 'addEventListener' | 'defaultView'> = {
    visibilityState: visibility,
    addEventListener: vi.fn(),
    defaultView: null,
  };
  const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: page }] });
  return runInInjectionContext(injector, () => new BackgroundChecks());
}

describe('BackgroundChecks', () => {
  it('runs a check when the tab comes back after its gap, and on the timer after its period', () => {
    const checks = checksOn('visible');
    const run = vi.fn();
    checks.add(run, { everyMs: 600_000, minGapMs: 60_000 }, 0);
    checks.runDue('visible', 1000);
    expect(run).not.toHaveBeenCalled();
    checks.runDue('visible', 60_000);
    expect(run).toHaveBeenCalledTimes(1);
    checks.runDue('tick', 120_000);
    expect(run).toHaveBeenCalledTimes(1);
    checks.runDue('tick', 660_000);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('never runs while the tab is hidden, and stops once removed', () => {
    const hidden = checksOn('hidden');
    const run = vi.fn();
    hidden.add(run, { everyMs: 1, minGapMs: 1 }, 0);
    hidden.runDue('tick', 1_000_000);
    expect(run).not.toHaveBeenCalled();
    const visible = checksOn('visible');
    visible.add(run, { everyMs: 1, minGapMs: 1 }, 0)();
    visible.runDue('tick', 1_000_000);
    expect(run).not.toHaveBeenCalled();
  });
});
