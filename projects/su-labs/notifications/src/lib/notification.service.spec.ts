import { describe, expect, it, vi } from 'vitest';
import { SuNotificationService } from './notification.service';

describe('SuNotificationService', () => {
  it('should expose the notifications as a signal', () => {
    const service = new SuNotificationService();
    const id = service.show({ message: 'Hello', type: 'success' });

    expect(service.notifications().map((n) => n.id)).toEqual([id]);

    service.dismiss(id);
    expect(service.notifications()).toEqual([]);
  });

  it('should clear all notifications', () => {
    const service = new SuNotificationService();
    service.show({ message: 'One', type: 'info' });
    service.show({ message: 'Two', type: 'error' });

    service.clearAll();

    expect(service.notifications()).toEqual([]);
  });

  it('should read and write the position through configure and the property', () => {
    const service = new SuNotificationService();
    expect(service.position).toBe('top-right');

    service.configure({ position: 'bottom-left' });
    expect(service.position).toBe('bottom-left');

    service.position = 'top-center';
    expect(service.position).toBe('top-center');
  });

  it('should stop syncing and cancel timers on destroy', () => {
    vi.useFakeTimers();
    const service = new SuNotificationService();
    service.show({ message: 'Pending', type: 'info' });

    service.ngOnDestroy();

    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });
});
