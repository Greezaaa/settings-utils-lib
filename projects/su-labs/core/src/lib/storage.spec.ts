import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSuCookieStorage, getSuLocalStorage } from './storage';

/** Cookies written through `document.cookie`, captured while the real jar still works */
function captureCookieWrites(): string[] {
  const writes: string[] = [];
  const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  vi.spyOn(document, 'cookie', 'set').mockImplementation((value: string) => {
    writes.push(value);
    descriptor?.set?.call(document, value);
  });
  return writes;
}

describe('createSuCookieStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    for (const key of ['su:a', 'su:b']) {
      createSuCookieStorage().removeItem(key);
    }
  });

  it('should save, read and remove a value', () => {
    const storage = createSuCookieStorage();
    expect(storage.getItem('su:a')).toBeNull();

    storage.setItem('su:a', 'dark');
    expect(storage.getItem('su:a')).toBe('dark');

    storage.removeItem('su:a');
    expect(storage.getItem('su:a')).toBeNull();
  });

  it('should keep keys apart and survive special characters', () => {
    const storage = createSuCookieStorage();
    storage.setItem('su:a', 'one; two=3');
    storage.setItem('su:b', '16');
    expect(storage.getItem('su:a')).toBe('one; two=3');
    expect(storage.getItem('su:b')).toBe('16');
  });

  it('should write a site-wide, long-lived, same-site cookie', () => {
    const writes = captureCookieWrites();
    createSuCookieStorage({ maxAgeDays: 2 }).setItem('su:a', 'dark');
    expect(writes).toEqual(['su%3Aa=dark; path=/; max-age=172800; SameSite=Lax']);
  });

  it('should leave out a domain the page is not on, so localhost keeps working', () => {
    const writes = captureCookieWrites();
    createSuCookieStorage({ domain: 'example.com' }).setItem('su:a', 'dark');
    expect(writes[0]).not.toContain('domain=');
  });

  it('should share with the parent domain from a subdomain, over https only', () => {
    vi.stubGlobal('location', { hostname: 'games.example.com', protocol: 'https:' });
    const writes = captureCookieWrites();
    createSuCookieStorage({ domain: 'example.com' }).setItem('su:a', 'dark');
    expect(writes[0]).toContain('; domain=example.com');
    expect(writes[0]).toContain('; Secure');
  });

  it('should expire the cookie to remove a value', () => {
    const writes = captureCookieWrites();
    createSuCookieStorage().removeItem('su:a');
    expect(writes[0]).toContain('max-age=0');
  });
});

describe('getSuLocalStorage', () => {
  it('should return localStorage in a browser', () => {
    expect(getSuLocalStorage()).toBe(localStorage);
  });
});
