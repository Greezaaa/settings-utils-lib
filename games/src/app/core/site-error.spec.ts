import { describe, expect, it } from 'vitest';
import { siteErrorOf } from './site-error';

describe('siteErrorOf', () => {
  it('keeps the error’s name and message and the page without its query', () => {
    expect(siteErrorOf(new TypeError('x is undefined'), '/find-pairs/?a=1#top')).toEqual({
      code: 'js',
      title: 'TypeError',
      problem: 'x is undefined',
      path: '/find-pairs/',
    });
    expect(siteErrorOf('just text', '')).toEqual({ code: 'js', title: 'Error', problem: 'just text', path: '/' });
  });
});
