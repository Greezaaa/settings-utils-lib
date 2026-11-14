import { describe, expect, it } from 'vitest';
import { byTone, toneOf } from './theme-tone';

describe('theme tone', () => {
  it('tells light backgrounds from dark ones', () => {
    expect(toneOf('#f6f6f4')).toBe('light');
    expect(toneOf('#fff')).toBe('light');
    expect(toneOf('white')).toBe('light');
    expect(toneOf('#191919')).toBe('dark');
    expect(toneOf('#3d0e7e')).toBe('dark');
    expect(toneOf('black')).toBe('dark');
    expect(toneOf(undefined)).toBe('light');
  });

  it('groups items by the tone of their background, keeping their order', () => {
    const items = [
      { id: 'a', background: '#000' },
      { id: 'b', background: '#fff' },
      { id: 'c', background: '#121212' },
    ];
    const groups = byTone(items, ({ background }) => background);
    expect(groups.dark.map(({ id }) => id)).toEqual(['a', 'c']);
    expect(groups.light.map(({ id }) => id)).toEqual(['b']);
  });
});
