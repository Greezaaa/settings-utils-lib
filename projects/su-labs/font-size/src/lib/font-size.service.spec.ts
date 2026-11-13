import { beforeEach, describe, expect, it } from 'vitest';
import { FontSizeService } from './font-size.service';

describe('FontSizeService', () => {
  let service: FontSizeService;

  beforeEach(() => {
    localStorage.clear();
    service = new FontSizeService();
    service.init();
  });

  it('should expose the default size and limits as signals', () => {
    expect(service.fontSize()).toBe(14);
    expect(service.isDefault()).toBe(true);
    expect([service.minSize(), service.maxSize(), service.step()]).toEqual([10, 22, 2]);
  });

  it('should sync configuration into the signals', () => {
    service.configure({ minSize: 8, maxSize: 30, defaultSize: 20, step: 5 });

    expect(service.minSize()).toBe(8);
    expect(service.maxSize()).toBe(30);
    expect(service.defaultSize()).toBe(20);
    expect(service.step()).toBe(5);
  });

  it('should update the size signal and computed flags', () => {
    service.setFontSize(22);
    expect(service.fontSize()).toBe(22);
    expect(service.isMax()).toBe(true);

    service.setFontSize(10);
    expect(service.isMin()).toBe(true);
  });

  it('should increase and decrease by the configured or given step', () => {
    service.increase();
    expect(service.fontSize()).toBe(16);

    service.decrease(4);
    expect(service.fontSize()).toBe(12);
  });

  it('should start from a size written directly to the signal', () => {
    service.fontSize.set(20);

    service.increase();

    expect(service.fontSize()).toBe(22);
  });

  it('should reset to the default size and clear storage', () => {
    service.increase();

    service.reset();

    expect(service.fontSize()).toBe(14);
    expect(localStorage.getItem('su:font-size')).toBeNull();
  });
});
