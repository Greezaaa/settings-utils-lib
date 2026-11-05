import { beforeEach, describe, expect, it } from 'vitest';
import { SuVisitData } from './visit-tracker.types';
import { SuVisitTrackerController } from './visit-tracker.controller';

const save = (data: Partial<SuVisitData>, key = 'su:visits'): void => localStorage.setItem(key, JSON.stringify(data));
const saved = (key = 'su:visits'): SuVisitData => JSON.parse(localStorage.getItem(key) ?? 'null');

describe('SuVisitTrackerController', () => {
  let controller: SuVisitTrackerController;

  beforeEach(() => {
    localStorage.clear();
    controller = new SuVisitTrackerController();
  });

  it('should start empty before init', () => {
    expect(controller.visit.get()).toEqual({ count: 0, lastVisit: null, milestone: null });
  });

  it('should record the first visit', () => {
    controller.init();

    expect(controller.visit.get()).toEqual({ count: 1, lastVisit: null, milestone: null });
    expect(saved().count).toBe(1);
    expect(new Date(saved().lastVisit).toISOString()).toBe(saved().lastVisit);
  });

  it('should continue from saved data and expose the previous visit date', () => {
    save({ count: 2, lastVisit: '2026-01-01T00:00:00.000Z' });

    controller.init();

    expect(controller.visit.get()).toMatchObject({ count: 3, lastVisit: '2026-01-01T00:00:00.000Z' });
  });

  it('should flag the default milestones', () => {
    save({ count: 9 });
    controller.init();
    expect(controller.visit.get().milestone).toBe(10);

    save({ count: 99 });
    controller.init();
    expect(controller.visit.get().milestone).toBe(100);
  });

  it('should flag custom milestones only', () => {
    save({ count: 4 });
    controller.init({ milestoneVisits: [5, 3] });
    expect(controller.visit.get().milestone).toBe(5);

    controller.init();
    expect(controller.visit.get().milestone).toBeNull();
  });

  it('should use a custom storage key', () => {
    controller.init({ storageKey: 'my-visits' });

    expect(saved('my-visits').count).toBe(1);
    expect(localStorage.getItem('su:visits')).toBeNull();
  });

  it('should start over when the saved data is invalid', () => {
    localStorage.setItem('su:visits', '{not json');
    controller.init();
    expect(controller.visit.get().count).toBe(1);

    localStorage.setItem('su:visits', JSON.stringify({ count: 'many' }));
    controller.init();
    expect(controller.visit.get().count).toBe(1);
  });

  it('should notify subscribers', () => {
    const counts: number[] = [];
    controller.visit.subscribe((visit) => counts.push(visit.count));

    controller.init();

    expect(counts).toEqual([0, 1]);
  });
});
