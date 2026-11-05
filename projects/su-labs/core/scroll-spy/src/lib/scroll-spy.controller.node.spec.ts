// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SuScrollSpyController } from './scroll-spy.controller';

describe('SuScrollSpyController without a DOM (Node / SSR)', () => {
  it('should accept sections without observing and still allow manual updates', () => {
    const controller = new SuScrollSpyController();
    const fakeElement = {} as Element;

    const stop = controller.observe(fakeElement, 'home');
    controller.setActiveSection('about');

    expect(controller.activeSection.get()).toBe('about');
    expect(() => stop()).not.toThrow();
    expect(() => controller.destroy()).not.toThrow();
  });
});
