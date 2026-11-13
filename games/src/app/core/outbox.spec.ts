import { beforeEach, describe, expect, it } from 'vitest';
import { flushOutbox, OUTBOX_LIMIT, OutboxItem, parseOutbox, readOutbox, SendResult, withItem, writeOutbox } from './outbox';

const play = (game: string): OutboxItem => ({ path: '/v1/plays', body: { game } });

describe('outbox', () => {
  beforeEach(() => localStorage.clear());

  it('keeps only well-formed items for the API', () => {
    expect(parseOutbox([play('math-games'), { path: 'https://elsewhere.test/v1/x', body: {} }, { path: '/v1/plays' }, 3])).toEqual([
      play('math-games'),
    ]);
    expect(parseOutbox('nope')).toEqual([]);
  });

  it('keeps the newest items up to its limit', () => {
    let items: OutboxItem[] = [];
    for (let index = 0; index < OUTBOX_LIMIT + 5; index++) {
      items = withItem(items, play(`game-${index}`));
    }
    expect(items).toHaveLength(OUTBOX_LIMIT);
    expect(items[0]).toEqual(play('game-5'));
  });

  it('sends what it can, keeps what could not reach the API and drops what the API refused', async () => {
    writeOutbox([play('sent'), play('refused'), play('later')]);
    const results: Record<string, SendResult> = { sent: 'sent', refused: 'rejected', later: 'unreachable' };
    await flushOutbox(async (item) => results[String(Reflect.get(item.body, 'game'))]);
    expect(readOutbox()).toEqual([play('later')]);
  });

  it('keeps items added while it was sending', async () => {
    writeOutbox([play('first')]);
    await flushOutbox(async () => {
      writeOutbox([...readOutbox(), play('added')]);
      return 'sent';
    });
    expect(readOutbox()).toEqual([play('added')]);
  });
});
