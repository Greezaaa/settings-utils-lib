import { field } from './api-url';
import { readStored, writeStored } from './site-storage';

const OUTBOX_STORAGE = 'outbox';
export const OUTBOX_LIMIT = 100;

export interface OutboxItem {
  readonly path: string;
  readonly body: object;
}

export type SendResult = 'sent' | 'rejected' | 'unreachable';

export function parseOutbox(stored: unknown): OutboxItem[] {
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored.flatMap((item: unknown) => {
    const path = field(item, 'path');
    const body = field(item, 'body');
    return typeof path === 'string' && path.startsWith('/v1/') && typeof body === 'object' && body !== null
      ? [{ path, body }]
      : [];
  });
}

export const withItem = (items: readonly OutboxItem[], item: OutboxItem): OutboxItem[] =>
  [...items, item].slice(-OUTBOX_LIMIT);

export const readOutbox = (): OutboxItem[] => parseOutbox(readStored(OUTBOX_STORAGE));

export const writeOutbox = (items: readonly OutboxItem[]): void => writeStored(OUTBOX_STORAGE, items);

export async function flushOutbox(send: (item: OutboxItem) => Promise<SendResult>): Promise<void> {
  const sending = readOutbox();
  const waiting: OutboxItem[] = [];
  for (const item of sending) {
    if ((await send(item)) === 'unreachable') {
      waiting.push(item);
    }
  }
  const addedMeanwhile = readOutbox().slice(sending.length);
  writeOutbox([...waiting, ...addedMeanwhile]);
}
