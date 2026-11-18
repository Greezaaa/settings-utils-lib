import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuTooltipController } from './tooltip.controller';

describe('SuTooltipController', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts closed and opens after the show delay', () => {
    const tooltip = new SuTooltipController({ showDelay: 200 });

    tooltip.show();
    vi.advanceTimersByTime(199);
    expect(tooltip.state.get().open).toBe(false);

    vi.advanceTimersByTime(1);
    expect(tooltip.state.get().open).toBe(true);
  });

  it('stays open when the pointer comes back before the hide delay ends', () => {
    const tooltip = new SuTooltipController({ hideDelay: 100 });
    tooltip.open();

    tooltip.hide();
    vi.advanceTimersByTime(50);
    tooltip.show();
    vi.advanceTimersByTime(500);

    expect(tooltip.state.get().open).toBe(true);
  });

  it('does not open when the pointer only passes over the trigger', () => {
    const tooltip = new SuTooltipController();

    tooltip.show();
    vi.advanceTimersByTime(100);
    tooltip.hide();
    vi.advanceTimersByTime(1000);

    expect(tooltip.state.get().open).toBe(false);
  });

  it('opens, closes and toggles at once, calling off a pending wait', () => {
    const tooltip = new SuTooltipController();
    const changes: boolean[] = [];
    tooltip.state.subscribe(state => changes.push(state.open));

    tooltip.show();
    tooltip.close();
    vi.advanceTimersByTime(1000);
    tooltip.toggle();
    tooltip.open();
    tooltip.toggle();

    expect(changes).toEqual([false, true, false]);
  });

  it('opens at once with no delay and uses new delays from the next wait', () => {
    const tooltip = new SuTooltipController({ showDelay: 0 });

    tooltip.show();
    expect(tooltip.state.get().open).toBe(true);

    tooltip.setDelays({ hideDelay: 400 });
    tooltip.hide();
    vi.advanceTimersByTime(399);
    expect(tooltip.state.get().open).toBe(true);
    vi.advanceTimersByTime(1);
    expect(tooltip.state.get().open).toBe(false);
  });

  it('cancel stops a pending show', () => {
    const tooltip = new SuTooltipController();

    tooltip.show();
    tooltip.cancel();
    vi.advanceTimersByTime(1000);

    expect(tooltip.state.get().open).toBe(false);
  });
});
