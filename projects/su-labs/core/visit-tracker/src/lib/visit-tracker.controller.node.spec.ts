// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SuVisitTrackerController } from './visit-tracker.controller';

describe('SuVisitTrackerController without a DOM (Node / SSR)', () => {
  it('should not count a visit or touch localStorage', () => {
    const controller = new SuVisitTrackerController();

    expect(() => controller.init()).not.toThrow();
    expect(controller.visit.get().count).toBe(0);
  });
});
