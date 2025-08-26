import { describe, it, expect, vi } from 'vitest';
import { SuNotificationService } from './notification.service';
import { SuNotificationOptions } from './notification.model';

describe('SuNotificationService', () => {
  it('should add a notification when show() is called', () => {
    const service = new SuNotificationService();
    const options: SuNotificationOptions = {
      message: 'Hello World',
      type: 'success',
      duration: 2000,
    };

    const id = service.show(options);
    const notifications = service.notifications();

    expect(notifications.length).toBe(1);
    expect(notifications[0].id).toBe(id);
    expect(notifications[0].message).toBe('Hello World');
    expect(notifications[0].type).toBe('success');
  });

  it('should allow multiple notifications', () => {
    const service = new SuNotificationService();
    service.show({ message: 'First', type: 'info' });
    service.show({ message: 'Second', type: 'error' });

    const notifications = service.notifications();
    expect(notifications.length).toBe(2);
    expect(notifications.map((n) => n.message)).toEqual(['First', 'Second']);
  });

  it('should dismiss a notification by id', () => {
    const service = new SuNotificationService();
    const id = service.show({ message: 'To be removed', type: 'warning' });

    service.dismiss(id);

    const notifications = service.notifications();
    expect(notifications.find((n) => n.id === id)).toBeUndefined();
  });

  it('should clear all notifications', () => {
    const service = new SuNotificationService();
    service.show({ message: 'One', type: 'info' });
    service.show({ message: 'Two', type: 'error' });

    service.clearAll();

    expect(service.notifications().length).toBe(0);
  });

  it('should auto dismiss notification after duration', async () => {
    vi.useFakeTimers();
    const service = new SuNotificationService();
    const id = service.show({
      message: 'Auto close',
      type: 'info',
      duration: 1000,
    });

    // Initially present
    expect(service.notifications().find((n) => n.id === id)).toBeDefined();

    // Fast forward time
    vi.advanceTimersByTime(1000);

    // Should be removed
    expect(service.notifications().find((n) => n.id === id)).toBeUndefined();
    vi.useRealTimers();
  });
});
