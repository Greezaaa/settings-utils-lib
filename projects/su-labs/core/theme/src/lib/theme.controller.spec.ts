import { SuStorage } from '@su-labs/core';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuThemeController } from './theme.controller';
import { SuThemeConfig } from './theme.types';

/** A storage kept in memory, standing in for a custom one such as cookie storage */
function memoryStorage(initial: Record<string, string> = {}): SuStorage & { readonly values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

let matchMediaCallback: ((e: MediaQueryListEvent) => void) | null = null;
let currentMatches = false;

beforeAll(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: currentMatches,
    media: query,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      matchMediaCallback = cb;
    },
    removeEventListener: () => {
      matchMediaCallback = null;
    },
    onchange: null,
    dispatchEvent: vi.fn(),
  }));
});

describe('SuThemeController', () => {
  let service: SuThemeController;

  beforeEach(() => {
    localStorage.clear();
    currentMatches = false;
    matchMediaCallback = null;
    service = new SuThemeController();
    document.documentElement.setAttribute('data-theme', '');
    document.documentElement.style.cssText = '';
  });

  it('should initialize with default theme "system" if no config', () => {
    service.init();
    expect(service.getUserPreference()).toBe('system');
    expect(['light', 'dark']).toContain(service.getTheme());
  });

  it('should apply custom CSS variables from a configuration', () => {
    const customConfig: SuThemeConfig = {
      themes: {
        light: {
          color: 'red',
          background: 'black',
        },
      },
    };
    service.init(customConfig);
    service.setTheme('light');

    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue('--su-theme-color')).toBe('red');
    expect(rootStyle.getPropertyValue('--su-theme-background')).toBe('black');
  });

  it('should save user preference to localStorage', () => {
    service.init();
    service.setTheme('dark');
    expect(localStorage.getItem('su:theme')).toBe('dark');
  });

  it('should read and save the preference in a configured storage instead of localStorage', () => {
    const storage = memoryStorage({ 'su:theme': 'dark' });
    service.init({ storage });
    expect(service.getTheme()).toBe('dark');

    service.setTheme('contrast');
    expect(storage.values.get('su:theme')).toBe('contrast');
    expect(localStorage.getItem('su:theme')).toBeNull();
  });

  it('should apply the theme to a target element instead of <html>', () => {
    const board = document.createElement('section');
    service.init({ target: board, defaultTheme: 'custom', themes: { custom: { background: 'navy' } } });

    expect(board.getAttribute('data-theme')).toBe('custom');
    expect(board.style.getPropertyValue('--su-theme-background')).toBe('navy');
    expect(document.documentElement.getAttribute('data-theme')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--su-theme-background')).toBe('');
  });

  it('should resolve system theme when preference is "system"', () => {
    currentMatches = true;
    service.init({ defaultTheme: 'system' });
    expect(service.getTheme()).toBe('dark');
    expect(service.getUserPreference()).toBe('system');
  });

  describe('setTheme method', () => {
    it('should update the theme and apply default variables', () => {
      service.init();
      service.setTheme('dark');
      expect(service.getTheme()).toBe('dark');
      const rootStyle = getComputedStyle(document.documentElement);
      expect(rootStyle.getPropertyValue('--su-theme-background')).toBe('#1a1a1a');
    });

    it('should update theme and apply custom variables for the specified theme', () => {
      const customConfig: SuThemeConfig = {
        themes: {
          dark: {
            background: '#000000',
            color: '#ffffff',
          },
        },
      };
      service.init(customConfig);
      service.setTheme('dark');

      const rootStyle = getComputedStyle(document.documentElement);
      expect(service.getTheme()).toBe('dark');
      expect(rootStyle.getPropertyValue('--su-theme-background')).toBe('#000000');
      expect(rootStyle.getPropertyValue('--su-theme-color')).toBe('#ffffff');
    });
  });

  it('should listen and react to system theme changes only when preference is "system"', () => {
    service.init({ defaultTheme: 'system' });
    expect(service.getTheme()).toBe('light');

    currentMatches = true;
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('dark');

    currentMatches = false;
    matchMediaCallback?.({ matches: false } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('light');

    service.setTheme('dark', true);
    expect(service.getUserPreference()).toBe('dark');

    currentMatches = true;
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('dark');
  });

  it('should notify theme subscribers when the theme changes', () => {
    service.init({ defaultTheme: 'light' });
    const listener = vi.fn();
    service.theme.subscribe(listener);
    service.setTheme('dark');
    expect(listener).toHaveBeenLastCalledWith('dark');
  });

  it('should notify theme subscribers when the system theme changes', () => {
    service.init({ defaultTheme: 'system' });
    const listener = vi.fn();
    service.theme.subscribe(listener);
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);
    expect(listener).toHaveBeenLastCalledWith('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should remove event listeners on destroy', () => {
    const removeSpy = vi.fn();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: removeSpy,
      media: '',
      onchange: null,
      dispatchEvent: vi.fn(),
    }));
    service.init({ defaultTheme: 'system' });
    service.destroy();
    expect(removeSpy).toHaveBeenCalled();
  });

  describe('palettes', () => {
    const root = document.documentElement;

    it('offers no palette unless the config lists it', () => {
      service.init({ defaultTheme: 'light' });
      service.setTheme('solar');
      expect(service.getTheme()).toBe('light');
      expect(service.availableThemes()).not.toContain('solar');
    });

    it('applies a listed palette with its variables and scheme', () => {
      service.init({ defaultTheme: 'light', palettes: ['neon', 'solar'] });
      service.setTheme('neon');
      expect(service.getTheme()).toBe('neon');
      expect(root.getAttribute('data-theme')).toBe('neon');
      expect(root.getAttribute('data-theme-scheme')).toBe('dark');
      expect(root.style.getPropertyValue('--su-theme-background')).toBe('#232326');
      expect(service.availableThemes()).toEqual(['light', 'dark', 'contrast', 'custom', 'system', 'neon', 'solar']);
    });

    it('drops a palette variable the next theme does not set', () => {
      service.init({ palettes: ['solar'] });
      service.setTheme('solar');
      expect(root.style.getPropertyValue('--su-theme-button-text')).toBe('#1b2440');
      service.setTheme('light');
      expect(root.style.getPropertyValue('--su-theme-button-text')).toBe('');
      expect(root.getAttribute('data-theme-scheme')).toBe('light');
    });

    it('falls back to the default when the saved palette is not offered here, keeping the saved choice', () => {
      const storage = memoryStorage({ 'su:theme': 'ember' });
      service.init({ storage, defaultTheme: 'dark' });
      expect(service.getTheme()).toBe('dark');
      expect(storage.values.get('su:theme')).toBe('ember');
    });
  });
});
