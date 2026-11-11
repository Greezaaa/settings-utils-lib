import { describe, expect, it } from 'vitest';
import { ADMIN_PAGE_SIZE } from '../../core/admin-api';
import { PagedList } from './paged-list';

const ROWS = Array.from({ length: ADMIN_PAGE_SIZE + 10 }, (_, index) => index);
const fromRows = (rows: number[]) => (offset: number) => Promise.resolve(rows.slice(offset, offset + ADMIN_PAGE_SIZE));

describe('PagedList', () => {
  it('loads the first page, then the rest on request', async () => {
    const list = new PagedList(fromRows(ROWS));
    await list.reload();
    expect(list.items()).toHaveLength(ADMIN_PAGE_SIZE);
    expect(list.hasMore()).toBe(true);
    await list.loadMore();
    expect(list.items()).toEqual(ROWS);
    expect(list.hasMore()).toBe(false);
  });

  it('starts the next page after the rows still shown once one is removed', async () => {
    const rows = [...ROWS];
    const list = new PagedList(fromRows(rows));
    await list.reload();
    rows.splice(0, 1);
    list.remove(0);
    await list.loadMore();
    expect(list.items()).toEqual(ROWS.slice(1));
  });

  it('drops an answer that arrives after a newer reload', async () => {
    const answers: ((rows: number[]) => void)[] = [];
    const list = new PagedList(() => new Promise<number[]>(resolve => answers.push(resolve)));
    const first = list.reload();
    const second = list.reload();
    answers[1]([2]);
    answers[0]([1]);
    await Promise.all([first, second]);
    expect(list.items()).toEqual([2]);
  });
});
