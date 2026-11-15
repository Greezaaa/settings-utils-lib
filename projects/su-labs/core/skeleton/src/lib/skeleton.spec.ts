import { describe, expect, it } from 'vitest';
import { setSuSkeletonBusy } from './skeleton';

describe('setSuSkeletonBusy', () => {
  it('marks the region busy and polite while loading', () => {
    const region = document.createElement('section');

    setSuSkeletonBusy(region, true);

    expect(region.getAttribute('aria-busy')).toBe('true');
    expect(region.getAttribute('aria-live')).toBe('polite');
  });

  it('clears busy once the content is ready, keeping the region polite', () => {
    const region = document.createElement('section');
    setSuSkeletonBusy(region, true);

    setSuSkeletonBusy(region, false);

    expect(region.getAttribute('aria-busy')).toBe('false');
    expect(region.getAttribute('aria-live')).toBe('polite');
  });
});
