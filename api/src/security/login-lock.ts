export const MAX_FAILED_LOGINS = 5;
const LOCK_MS = 15 * 60 * 1000;

export interface LoginLock {
  readonly failedLogins: number;
  readonly lockedUntil: Date | null;
}

export const isLocked = ({ lockedUntil }: LoginLock, now: Date): boolean =>
  lockedUntil !== null && lockedUntil > now;

export function afterFailure(lock: LoginLock, now: Date): LoginLock {
  const failedLogins = lock.failedLogins + 1;
  return failedLogins >= MAX_FAILED_LOGINS
    ? { failedLogins: 0, lockedUntil: new Date(now.getTime() + LOCK_MS) }
    : { failedLogins, lockedUntil: lock.lockedUntil };
}

export const UNLOCKED: LoginLock = { failedLogins: 0, lockedUntil: null };
