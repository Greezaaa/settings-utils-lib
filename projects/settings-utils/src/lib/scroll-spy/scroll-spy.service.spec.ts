import { describe, it, expect, beforeEach } from 'vitest';
import { ScrollSpyService } from './scroll-spy.service';

describe('ScrollSpyService', () => {
  let service: ScrollSpyService;

  beforeEach(() => {
    service = new ScrollSpyService();
  });

  it('should start with empty activeSection', () => {
    expect(service.activeSection()).toBe('');
  });

  it('should update activeSection when set is called', () => {
    service.activeSection.set('main');
    expect(service.activeSection()).toBe('main');
  });
});
