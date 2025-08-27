import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuThemeService } from './theme.service';
import { SuThemeConfig } from './theme.types';

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

describe('SuThemeService', () => {
  let service: SuThemeService;

  beforeEach(() => {
    localStorage.clear();
    currentMatches = false;
    matchMediaCallback = null;
    service = new SuThemeService();
    // Reset the DOM for each test
    document.documentElement.setAttribute('data-theme', '');
    document.documentElement.style.cssText = '';
  });

  it('should initialize with default theme "system" if no config', () => {
    service.init();
    expect(service.getUserPreference()).toBe('system');
    // The resolved theme can be either 'light' or 'dark' based on the initial `currentMatches`
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

  it('should resolve system theme when preference is "system"', () => {
    currentMatches = true; // Simulates dark mode
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
    // Initial state: system preference, light mode
    service.init({ defaultTheme: 'system' });
    expect(service.getTheme()).toBe('light');

    // System switches to dark mode
    currentMatches = true;
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('dark');

    // System switches back to light mode
    currentMatches = false;
    matchMediaCallback?.({ matches: false } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('light');

    // User switches to a specific theme, listener should no longer react
    service.setTheme('dark', true);
    expect(service.getUserPreference()).toBe('dark');

    currentMatches = true;
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('dark'); // Theme should not change
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
    service.ngOnDestroy();
    expect(removeSpy).toHaveBeenCalled();
  });
});