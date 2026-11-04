import { afterEach, describe, it, expect, vi } from 'vitest';
import { isSuNotificationImageIcon, SuNotificationController } from './notification.controller';
import { SuNotificationOptions } from './notification.types';

describe('SuNotificationController', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add a notification when show() is called', () => {
    const controller = new SuNotificationController();
    const options: SuNotificationOptions = {
      message: 'Hello World',
      type: 'success',
      duration: 2000,
    };

    const id = controller.show(options);
    const notifications = controller.notifications.get();

    expect(notifications.length).toBe(1);
    expect(notifications[0].id).toBe(id);
    expect(notifications[0].message).toBe('Hello World');
    expect(notifications[0].type).toBe('success');
  });

  it('should apply default options', () => {
    const controller = new SuNotificationController();
    controller.show({ message: 'Defaults', type: 'info' });

    expect(controller.notifications.get()[0]).toMatchObject({ duration: 3000, autoClose: true, icon: true });
  });

  it('should allow multiple notifications', () => {
    const controller = new SuNotificationController();
    controller.show({ message: 'First', type: 'info' });
    controller.show({ message: 'Second', type: 'error' });

    const notifications = controller.notifications.get();
    expect(notifications.length).toBe(2);
    expect(notifications.map((n) => n.message)).toEqual(['First', 'Second']);
  });

  it('should dismiss a notification by id', () => {
    const controller = new SuNotificationController();
    const id = controller.show({ message: 'To be removed', type: 'warning' });

    controller.dismiss(id);

    expect(controller.notifications.get().find((n) => n.id === id)).toBeUndefined();
  });

  it('should clear all notifications', () => {
    const controller = new SuNotificationController();
    controller.show({ message: 'One', type: 'info' });
    controller.show({ message: 'Two', type: 'error' });

    controller.clearAll();

    expect(controller.notifications.get().length).toBe(0);
  });

  it('should auto dismiss notification after duration', () => {
    vi.useFakeTimers();
    const controller = new SuNotificationController();
    const id = controller.show({
      message: 'Auto close',
      type: 'info',
      duration: 1000,
    });

    expect(controller.notifications.get().find((n) => n.id === id)).toBeDefined();

    vi.advanceTimersByTime(1000);

    expect(controller.notifications.get().find((n) => n.id === id)).toBeUndefined();
  });

  it('should keep a notification open when autoClose is false', () => {
    vi.useFakeTimers();
    const controller = new SuNotificationController();
    controller.show({ message: 'Sticky', type: 'info', autoClose: false });

    vi.advanceTimersByTime(10000);

    expect(controller.notifications.get().length).toBe(1);
  });

  it('should cancel pending timers on destroy', () => {
    vi.useFakeTimers();
    const controller = new SuNotificationController();
    controller.show({ message: 'Pending', type: 'info' });

    controller.destroy();

    expect(controller.notifications.get().length).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('should notify subscribers when the list changes', () => {
    const controller = new SuNotificationController();
    const listener = vi.fn();
    controller.notifications.subscribe(listener);

    controller.show({ message: 'Hello', type: 'info' });

    expect(listener).toHaveBeenLastCalledWith([expect.objectContaining({ message: 'Hello' })]);
  });

  it('should update the position when configured', () => {
    const controller = new SuNotificationController();
    expect(controller.position.get()).toBe('top-right');

    controller.configure({ position: 'bottom-center' });

    expect(controller.position.get()).toBe('bottom-center');
  });
});

describe('isSuNotificationImageIcon', () => {
  it.each(['/icons/ok.svg', 'https://example.com/icon', 'icon.png', 'icon.jpg'])('should treat %s as an image', (icon) => {
    expect(isSuNotificationImageIcon(icon)).toBe(true);
  });

  it.each([true, false, '<svg viewBox="0 0 24 24"></svg>'])('should not treat %s as an image', (icon) => {
    expect(isSuNotificationImageIcon(icon)).toBe(false);
  });
});
