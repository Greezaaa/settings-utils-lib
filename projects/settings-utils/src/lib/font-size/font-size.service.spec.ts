import { describe, it, expect, beforeEach } from 'vitest';
import { FontSizeService } from './font-size.service';

describe('FontSizeService', () => {
  let service: FontSizeService;

  beforeEach(() => {
    localStorage.clear();
    service = new FontSizeService();
    service.init();
  });

  // --- Initialization & defaults ---
  it('should start with default size', () => {
    expect(service.fontSize()).toBe(14);
    expect(service.isDefault()).toBe(true);
  });

  // --- Configuration ---
  it('should apply custom configuration', () => {
    service.configure({ minSize: 8, maxSize: 30, defaultSize: 20, step: 5 });
    expect(service.minSize()).toBe(8);
    expect(service.maxSize()).toBe(30);
    expect(service.defaultSize()).toBe(20);
    expect(service.step()).toBe(5);
  });

  it('should respect custom storage key', () => {
    service.configure({ storageKey: 'custom:key' });
    service.setFontSize(20);
    expect(localStorage.getItem('custom:key')).toBe('20');
  });

  // --- Font size changes ---
  it('should increase by default step', () => {
    service.increase();
    expect(service.fontSize()).toBe(16);
  });

  it('should respect custom step', () => {
    service.increase(5);
    expect(service.fontSize()).toBe(19);
  });

  it('should not exceed max size', () => {
    service.fontSize.set(22);
    service.increase();
    expect(service.fontSize()).toBe(22);
    expect(service.isMax()).toBe(true);
  });

  it('should not go below min size', () => {
    service.fontSize.set(10);
    service.decrease();
    expect(service.fontSize()).toBe(10);
    expect(service.isMin()).toBe(true);
  });

  // --- Persistence ---
  it('should read from localStorage on init', () => {
    localStorage.setItem('su:font-size', '18');
    service.init();
    expect(service.fontSize()).toBe(18);
  });

  it('should write to localStorage on font size change', () => {
    service.increase();
    expect(localStorage.getItem('su:font-size')).toBe('16');
  });

  // --- Reset ---
  it('should reset to default size and clear storage', () => {
    service.increase();
    expect(service.fontSize()).toBe(16);
    service.reset();
    expect(service.fontSize()).toBe(14);
    expect(localStorage.getItem('app:font-size')).toBeNull();
  });
});
