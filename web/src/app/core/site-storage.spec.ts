import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_COOKIE,
  deleteSaved,
  isSavingAllowed,
  readStored,
  setSavingAllowed,
  writeStored,
} from './site-storage';

const consentCookieSet = () =>
  document.cookie.split('; ').some((cookie) => cookie.startsWith(`${encodeURIComponent(CONSENT_COOKIE)}=`));

describe('site storage', () => {
  afterEach(() => {
    setSavingAllowed(true, () => undefined);
    localStorage.clear();
  });

  it('saves while the visitor allows it', () => {
    writeStored('visits', { count: 3 });
    expect(readStored('visits')).toEqual({ count: 3 });
    expect(isSavingAllowed()).toBe(true);
  });

  it('turning saving off deletes what was saved, forgets the shared cookies and keeps only the choice', () => {
    writeStored('visits', { count: 3 });
    localStorage.setItem('other-site:key', 'kept');
    const forget = vi.fn();
    setSavingAllowed(false, forget);
    expect(forget).toHaveBeenCalled();
    expect(isSavingAllowed()).toBe(false);
    expect(consentCookieSet()).toBe(true);
    expect(readStored('visits')).toBeUndefined();
    writeStored('visits', { count: 4 });
    expect(localStorage.getItem('su-labs-site:visits')).toBeNull();
    expect(localStorage.getItem('other-site:key')).toBe('kept');
  });

  it('deletes what was saved without changing the choice', () => {
    writeStored('visits', { count: 3 });
    deleteSaved(() => undefined);
    expect(readStored('visits')).toBeUndefined();
    expect(isSavingAllowed()).toBe(true);
  });
});
