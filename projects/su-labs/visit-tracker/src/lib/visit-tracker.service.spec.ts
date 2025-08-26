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

    service = new SuVisitTrackerService();
  });

  it('should initialize with count = 1 if localStorage is empty', () => {
    service.init();
    expect(service.count()).toBe(1);
    expect(service.lastVisit()).toBeNull();
    expect(service.milestone()).toBeNull();
  });

  it('should increment the count from existing localStorage data', () => {
    // Simulate a previous visit count of 2
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 2, lastVisit: null }),
    );
    service.init();
    // The new count should be 3
    expect(service.count()).toBe(3);
  });

  it('should set the last visit date as an ISO string', () => {
    service.init();
    const storedStr = localStorage.getItem('su:visits');
    expect(storedStr).not.toBeNull();
    if (storedStr) {
      const stored = JSON.parse(storedStr);
      // Verify that a lastVisit property exists and is a valid ISO string
      expect(typeof stored.lastVisit).toBe('string');
      expect(new Date(stored.lastVisit).toISOString()).toBe(stored.lastVisit);
    }
  });

  it('should mark default milestone visits correctly', () => {
    // Test for the default 10th visit milestone
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 9, lastVisit: null }),
    );
    service.init();
    expect(service.milestone()).toBe(10);

    // Test for the default 100th visit milestone
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 99, lastVisit: null }),
    );
    service.init();
    expect(service.milestone()).toBe(100);
  });

  it('should accept a custom storage key', () => {
    // Set a value in the custom key
    localStorage.setItem(
      'my-visits',
      JSON.stringify({ count: 0, lastVisit: null }),
    );
    // Initialize the service with the custom key
    service.init({ storageKey: 'my-visits' });
    const storedStr = localStorage.getItem('my-visits');
    expect(storedStr).not.toBeNull();
    if (storedStr) {
      const stored = JSON.parse(storedStr);
      expect(stored.count).toBe(1);
    }
    // Verify the default key was not used
    expect(localStorage.getItem('su:visits')).toBeNull();
  });

  it('should mark custom milestone visits correctly with a single signal', () => {
    // Test for a custom 3rd visit milestone
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 2, lastVisit: null }),
    );
    service.init({ milestoneVisits: [3, 5] });
    expect(service.milestone()).toBe(3);

    // Test for a custom 5th visit milestone
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 4, lastVisit: null }),
    );
    service.init({ milestoneVisits: [3, 5] });
    expect(service.milestone()).toBe(5);

    // Test for a non-milestone visit
    localStorage.setItem(
      'su:visits',
      JSON.stringify({ count: 5, lastVisit: null }),
    );
    service.init({ milestoneVisits: [3, 5] });
    expect(service.milestone()).toBeNull();
  });
});