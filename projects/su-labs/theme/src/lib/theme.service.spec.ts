import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuThemeService } from './theme.service';

let matchMediaCallback: ((e: MediaQueryListEvent) => void) | null = null;

beforeAll(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
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
    matchMediaCallback = null;
    service = new SuThemeService();
  });

  it('should expose the resolved theme as a signal', () => {
    service.init({ defaultTheme: 'light' });
    expect(service.theme()).toBe('light');

    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(service.getTheme()).toBe('dark');
  });

  it('should update the signal when the system theme changes', () => {
    service.init({ defaultTheme: 'system' });
    matchMediaCallback?.({ matches: true } as MediaQueryListEvent);

    expect(service.theme()).toBe('dark');
    expect(service.getUserPreference()).toBe('system');
  });

  it('should stop syncing and release listeners on destroy', () => {
    service.init({ defaultTheme: 'system' });
    service.ngOnDestroy();

    expect(matchMediaCallback).toBeNull();
  });
});
