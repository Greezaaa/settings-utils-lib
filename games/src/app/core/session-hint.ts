import { readStored, writeStored } from './site-storage';

/** Whose session a hint is about: the admin team's or a player's */
export type SessionKind = 'admin' | 'player';

const hintStorage = (kind: SessionKind): string => `${kind}-was-signed-in`;

/**
 * Whether this browser was signed in last time. The session cookie is HttpOnly, so scripts can't see it; this hint
 * lets sign-in forms show at once for visitors who weren't, while the API check runs in the background. Only a hint:
 * the API's answer always wins.
 */
export const wasSignedIn = (kind: SessionKind): boolean => readStored(hintStorage(kind)) === true;

/** Remembers whether this browser is signed in, after the API said so */
export const rememberSignedIn = (kind: SessionKind, signedIn: boolean): void => writeStored(hintStorage(kind), signedIn);
