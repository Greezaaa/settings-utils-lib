/** Failed sign-ins in a row before an account locks, and for how long (admins and players alike) */
export const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;

/** An account's sign-in state: failures in a row, and until when it's locked */
export interface LoginLock {
  readonly failedLogins: number;
  readonly lockedUntil: Date | null;
}

export const isLocked = ({ lockedUntil }: LoginLock, now: Date): boolean =>
  lockedUntil !== null && lockedUntil > now;

/** The state after one more wrong password: locked for a while at the limit, counting again from zero after it */
export function afterFailure(lock: LoginLock, now: Date): LoginLock {
  const failedLogins = lock.failedLogins + 1;
  return failedLogins >= MAX_FAILED_LOGINS
    ? { failedLogins: 0, lockedUntil: new Date(now.getTime() + LOCK_MS) }
    : { failedLogins, lockedUntil: lock.lockedUntil };
}

/** The state after the right password */
export const UNLOCKED: LoginLock = { failedLogins: 0, lockedUntil: null };
