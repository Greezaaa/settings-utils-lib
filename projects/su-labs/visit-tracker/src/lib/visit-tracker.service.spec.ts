import { beforeEach, describe, expect, it } from 'vitest';
import { SuVisitTrackerService } from './visit-tracker.service';

// Visit logic is tested in @su-labs/core/visit-tracker; these tests cover the Angular wrapper.
describe('SuVisitTrackerService', () => {
  let service: SuVisitTrackerService;

  beforeEach(() => {
    localStorage.clear();
    service = new SuVisitTrackerService();
  });

  it('should start with empty signals before init', () => {
    expect(service.count()).toBe(0);
    expect(service.lastVisit()).toBeNull();
    expect(service.milestone()).toBeNull();
  });

  it('should sync the recorded visit into the signals', () => {
    localStorage.setItem('su:visits', JSON.stringify({ count: 9, lastVisit: '2026-01-01T00:00:00.000Z' }));

    service.init();

    expect(service.count()).toBe(10);
    expect(service.lastVisit()).toBe('2026-01-01T00:00:00.000Z');
    expect(service.milestone()).toBe(10);
  });

  it('should pass the configuration to the controller', () => {
    service.init({ storageKey: 'my-visits', milestoneVisits: [1] });

    expect(service.milestone()).toBe(1);
    expect(localStorage.getItem('my-visits')).not.toBeNull();
  });
});
