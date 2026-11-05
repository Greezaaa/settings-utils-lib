// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SuFontSizeController } from './font-size.controller';

describe('SuFontSizeController without a DOM (Node / SSR)', () => {
  it('should keep state without touching the DOM or localStorage', () => {
    const controller = new SuFontSizeController();

    controller.init();
    controller.increase();
    expect(controller.fontSize.get()).toBe(16);

    controller.reset();
    expect(controller.fontSize.get()).toBe(14);
  });
});
