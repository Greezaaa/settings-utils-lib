import { describe, expect, it } from 'vitest';
import { fitWithin } from './shrink-image';

describe('fitWithin', () => {
  it('scales the longest side down to the limit, keeping the shape', () => {
    expect(fitWithin(4000, 3000, 1280)).toEqual({ width: 1280, height: 960 });
    expect(fitWithin(1000, 2000, 1280)).toEqual({ width: 640, height: 1280 });
  });

  it('never scales small pictures up', () => {
    expect(fitWithin(300, 200, 1280)).toEqual({ width: 300, height: 200 });
  });
});
