import { describe, expect, it } from 'vitest';
import { flyOutTransform } from './page-fly-out';

describe('flyOutTransform', () => {
  it('lays the page over the link it was opened from', () => {
    const link = { left: 20, top: 100, width: 200, height: 40 };
    const page = { left: 240, top: 0, width: 1000, height: 800 };

    expect(flyOutTransform(link, page)).toBe('translate(-220px, 100px) scale(0.2000, 0.0500)');
  });

  it('keeps the size of an empty page', () => {
    expect(flyOutTransform({ left: 0, top: 0, width: 10, height: 10 }, { left: 0, top: 0, width: 0, height: 0 })).toBe(
      'translate(0px, 0px) scale(1.0000, 1.0000)',
    );
  });
});
