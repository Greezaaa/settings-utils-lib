import { afterFailure, isLocked, MAX_FAILED_LOGINS, UNLOCKED } from './login-lock.js';

describe('login lock', () => {
  it('locks for a while after too many failures in a row', () => {
    const now = new Date('2026-11-08T12:00:00Z');
    let lock = UNLOCKED;
    for (let failure = 1; failure < MAX_FAILED_LOGINS; failure++) {
      lock = afterFailure(lock, now);
      expect(isLocked(lock, now)).toBe(false);
    }
    lock = afterFailure(lock, now);
    expect(isLocked(lock, now)).toBe(true);
    expect(isLocked(lock, new Date('2026-11-08T12:16:00Z'))).toBe(false);
    expect(lock.failedLogins).toBe(0);
  });
});
