// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SuThemeController } from './theme.controller';

describe('SuThemeController without a DOM (Node / SSR)', () => {
  it('should initialize and change theme without touching browser APIs', () => {
    const controller = new SuThemeController();

    expect(() => controller.init({ defaultTheme: 'dark' })).not.toThrow();
    expect(controller.getTheme()).toBe('dark');

    controller.setTheme('contrast');
    expect(controller.getTheme()).toBe('contrast');
  });

  it('should resolve "system" to light when there is no browser', () => {
    const controller = new SuThemeController();
    controller.init({ defaultTheme: 'system' });

    expect(controller.getUserPreference()).toBe('system');
    expect(controller.getTheme()).toBe('light');
    expect(() => controller.destroy()).not.toThrow();
  });
});
