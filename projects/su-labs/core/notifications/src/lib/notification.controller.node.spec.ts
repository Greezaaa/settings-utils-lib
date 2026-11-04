// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SuNotificationController } from './notification.controller';

describe('SuNotificationController without a DOM (Node / SSR)', () => {
  it('should show, dismiss and clean up notifications', () => {
    const controller = new SuNotificationController();

    const id = controller.show({ message: 'From Node', type: 'info' });
    expect(controller.notifications.get().map((n) => n.id)).toEqual([id]);

    controller.dismiss(id);
    expect(controller.notifications.get()).toEqual([]);
    expect(() => controller.destroy()).not.toThrow();
  });
});
