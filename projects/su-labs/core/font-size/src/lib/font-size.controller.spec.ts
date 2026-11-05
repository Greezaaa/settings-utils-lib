import { beforeEach, describe, expect, it } from 'vitest';
import { SuFontSizeController } from './font-size.controller';

const cssVar = (name = '--base-font-size'): string => document.documentElement.style.getPropertyValue(name);

describe('SuFontSizeController', () => {
  let controller: SuFontSizeController;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('style');
    controller = new SuFontSizeController();
  });

  describe('init', () => {
    it('should apply the default size when nothing is saved', () => {
      controller.init();

      expect(controller.fontSize.get()).toBe(14);
      expect(cssVar()).toBe('14px');
    });

    it('should load and clamp the saved size', () => {
      localStorage.setItem('su:font-size', '40');

      controller.init();

      expect(controller.fontSize.get()).toBe(22);
    });

    it('should ignore an invalid saved size', () => {
      localStorage.setItem('su:font-size', 'big');

      controller.init();

      expect(controller.fontSize.get()).toBe(14);
    });
  });

  describe('configure', () => {
    it('should update the limits', () => {
      controller.configure({ minSize: 8, maxSize: 30, defaultSize: 20, step: 5 });

      expect(controller.limits.get()).toEqual({ minSize: 8, maxSize: 30, defaultSize: 20, step: 5 });
    });

    it('should correct invalid combinations', () => {
      controller.configure({ minSize: 20, maxSize: 12, defaultSize: 5, step: 0 });

      expect(controller.limits.get()).toEqual({ minSize: 20, maxSize: 20, defaultSize: 20, step: 1 });
    });

    it('should clamp the current size to the new range', () => {
      controller.configure({ minSize: 16 });

      expect(controller.fontSize.get()).toBe(16);
    });

    it('should use a custom storage key and CSS variable', () => {
      controller.configure({ storageKey: 'custom:key', cssVarName: '--text-size' });

      controller.setFontSize(20);

      expect(localStorage.getItem('custom:key')).toBe('20');
      expect(cssVar('--text-size')).toBe('20px');
    });
  });

  describe('changing the size', () => {
    it('should set, apply and persist a size', () => {
      controller.setFontSize(18);

      expect(controller.fontSize.get()).toBe(18);
      expect(cssVar()).toBe('18px');
      expect(localStorage.getItem('su:font-size')).toBe('18');
    });

    it('should increase and decrease by the configured or given step', () => {
      controller.increase();
      expect(controller.fontSize.get()).toBe(16);

      controller.decrease(4);
      expect(controller.fontSize.get()).toBe(12);
    });

    it('should stay within the limits', () => {
      controller.setFontSize(100);
      expect(controller.fontSize.get()).toBe(22);

      controller.setFontSize(1);
      expect(controller.fontSize.get()).toBe(10);
    });

    it('should notify subscribers', () => {
      const values: number[] = [];
      controller.fontSize.subscribe((size) => values.push(size));

      controller.increase();

      expect(values).toEqual([14, 16]);
    });
  });

  describe('reset', () => {
    it('should return to the default size and forget the saved one', () => {
      controller.setFontSize(20);

      controller.reset();

      expect(controller.fontSize.get()).toBe(14);
      expect(cssVar()).toBe('14px');
      expect(localStorage.getItem('su:font-size')).toBeNull();
    });
  });
});
