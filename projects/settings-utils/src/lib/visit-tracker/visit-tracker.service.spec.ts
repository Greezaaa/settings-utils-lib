import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SuVisitTrackerService } from './visit-tracker.service';

describe('SuVisitTrackerService', () => {
  let service: SuVisitTrackerService;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => (store[key] = value),
      removeItem: (key: string) => delete store[key],
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
    });

    // create service without auto-increment from constructor
    service = new SuVisitTrackerService();
  });

  it('should initialize with count = 1 if localStorage empty', () => {
    service.init();
    expect(service.count()).toBe(1);
    expect(service.lastVisit()).toBeNull();
    expect(service.isTenthVisit()).toBe(false);
    expect(service.isHundredthVisit()).toBe(false);
  });

  it('should increment count from localStorage', () => {
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 2, lastVisit: null }),
    );
    service.init();
    expect(service.count()).toBe(3);
  });

  it('should set last visit correctly', () => {
    service.init();
    const storedStr = localStorage.getItem('su:visits');
    expect(storedStr).not.toBeNull();
    if (storedStr) {
      const stored = JSON.parse(storedStr);
      expect(typeof stored.lastVisit).toBe('string');
      expect(new Date(stored.lastVisit).toISOString()).toBe(stored.lastVisit);
    }
  });

  it('should mark milestone visits correctly', () => {
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 9, lastVisit: null }),
    );
    service.init();
    expect(service.isTenthVisit()).toBe(true); // 10th visit
    expect(service.isHundredthVisit()).toBe(false);

    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 99, lastVisit: null }),
    );
    service.init();
    expect(service.isHundredthVisit()).toBe(true); // 100th visit
    expect(service.isTenthVisit()).toBe(false);
  });

  it('should accept a custom storage key', () => {
    localStorage.setItem(
      'my-visits',
      JSON.stringify({ count: 0, lastVisit: null }),
    );
    service.init({ storageKey: 'my-visits' });
    const storedStr = localStorage.getItem('my-visits');
    expect(storedStr).not.toBeNull();
    if (storedStr) {
      const stored = JSON.parse(storedStr);
      expect(stored.count).toBe(1);
    }
  });

  it('should mark custom milestone visits correctly', () => {
    // Start from 2 previous visits
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 2, lastVisit: null }),
    );

    service.init({ milestoneVisits: [3, 5] }); // 3rd visit
    expect(service.isTenthVisit()).toBe(true); // first custom milestone
    expect(service.isHundredthVisit()).toBe(false);

    // Simulate 4th visit in localStorage
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 4, lastVisit: null }),
    );
    service.init({ milestoneVisits: [3, 5] }); // 5th visit
    expect(service.isTenthVisit()).toBe(false);
    expect(service.isHundredthVisit()).toBe(true); // second custom milestone
  });
});
