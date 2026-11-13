import { readStored, writeStored } from './site-storage';

export type SessionKind = 'admin' | 'player';

const hintStorage = (kind: SessionKind): string => `${kind}-was-signed-in`;

export const wasSignedIn = (kind: SessionKind): boolean => readStored(hintStorage(kind)) === true;

export const rememberSignedIn = (kind: SessionKind, signedIn: boolean): void => writeStored(hintStorage(kind), signedIn);
