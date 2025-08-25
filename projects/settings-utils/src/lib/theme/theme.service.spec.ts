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
  });

  it('should initialize with default theme if no config', () => {
    service.init();
    expect(service.getUserPreference()).toBe('system');
    expect(['light', 'dark']).toContain(service.getTheme());
  });

  it('should apply custom CSS variables', () => {
    const config: SuThemeConfig = {
      variables: {
        color: 'red',
        background: 'black',
      },
    };
    service.init(config);

    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue('--su-theme-color')).toBe('red');
    expect(rootStyle.getPropertyValue('--su-theme-background')).toBe('black');
  });

  it('should save user preference to localStorage', () => {
    service.init();
    service.setTheme('dark');
    expect(localStorage.getItem('su-theme')).toBe('dark');
  });

  it('should resolve system theme when preference is "system"', () => {
    currentMatches = true;
    service.init({ defaultTheme: 'system' });
    expect(service.getTheme()).toBe('dark');
  });

  it('should update theme when setTheme is called', () => {
    service.init();
    service.setTheme('dark');
    expect(service.getTheme()).toBe('dark');
    service.setTheme('light');
    expect(service.getTheme()).toBe('light');
  });

  it('should listen and react to system theme changes when preference is "system"', () => {
    service.init({ defaultTheme: 'system' });
    expect(service.getTheme()).toBe('light');

    currentMatches = true;
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('dark');

    currentMatches = false;
    matchMediaCallback?.({ matches: false } as MediaQueryListEvent);
    expect(service.getTheme()).toBe('light');
  });

  it('should remove event listeners on destroy', () => {
    const removeSpy = vi.fn();
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: removeSpy,
    }));
    service.init({ defaultTheme: 'system' });
    service.destroy();
    expect(removeSpy).toHaveBeenCalled();
  });
});
